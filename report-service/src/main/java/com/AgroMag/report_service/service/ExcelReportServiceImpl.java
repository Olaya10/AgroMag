package com.AgroMag.report_service.service;

import com.AgroMag.report_service.client.InventoryServiceClient;
import com.AgroMag.report_service.client.FincaServiceClient;
import com.AgroMag.report_service.dto.InsumoDTO;
import com.AgroMag.report_service.dto.LoteDTO;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service("excelReportService")
public class ExcelReportServiceImpl implements ReportService {

    private static final Logger log = LoggerFactory.getLogger(ExcelReportServiceImpl.class);

    @Autowired
    private InventoryServiceClient inventoryClient;

    @Autowired
    private FincaServiceClient fincaClient;

    @Override
    public byte[] generateInventoryReport() throws Exception {
        log.info("Generating Excel report for Inventory");
        try {
            List<InsumoDTO> insumos = inventoryClient.getAllInsumos();

            try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                Sheet sheet = workbook.createSheet("Inventario");

                // Header styling
                CellStyle headerStyle = workbook.createCellStyle();
                Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerStyle.setFont(headerFont);

                Row headerRow = sheet.createRow(0);
                String[] columns = {"ID", "Nombre", "Tipo", "Stock Actual", "Umbral Crítico", "Unidad"};
                for (int i = 0; i < columns.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(columns[i]);
                    cell.setCellStyle(headerStyle);
                }

                // Data
                int rowIdx = 1;
                if (insumos != null && !insumos.isEmpty()) {
                    for (InsumoDTO insumo : insumos) {
                        Row row = sheet.createRow(rowIdx++);
                        row.createCell(0).setCellValue(insumo.getId() != null ? insumo.getId() : 0);
                        row.createCell(1).setCellValue(insumo.getNombreComercial() != null ? insumo.getNombreComercial() : "S/N");
                        row.createCell(2).setCellValue(insumo.getTipo() != null ? insumo.getTipo() : "N/A");
                        row.createCell(3).setCellValue(insumo.getStockActual() != null ? insumo.getStockActual() : 0.0);
                        row.createCell(4).setCellValue(insumo.getUmbralCritico() != null ? insumo.getUmbralCritico() : 0.0);
                        row.createCell(5).setCellValue(insumo.getUnidadMedida() != null ? insumo.getUnidadMedida() : "-");
                    }
                } else {
                    log.warn("No insumos found for Excel report");
                    Row row = sheet.createRow(1);
                    row.createCell(0).setCellValue("No hay datos disponibles");
                }

                // Auto-size columns
                for (int i = 0; i < columns.length; i++) {
                    sheet.autoSizeColumn(i);
                }

                workbook.write(out);
                return out.toByteArray();
            }
        } catch (Exception e) {
            log.error("Error generating Inventory Excel report: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public byte[] generateLotesReport() throws Exception {
        log.info("Generating Excel report for Lotes");
        try {
            List<LoteDTO> lotes = fincaClient.getAllLotes();

            try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                Sheet sheet = workbook.createSheet("Lotes");

                CellStyle headerStyle = workbook.createCellStyle();
                Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerStyle.setFont(headerFont);

                Row headerRow = sheet.createRow(0);
                String[] columns = {"ID", "Nombre", "Extensión (Ha)", "Etapa", "Cultivo"};
                for (int i = 0; i < columns.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(columns[i]);
                    cell.setCellStyle(headerStyle);
                }

                // Data
                int rowIdx = 1;
                if (lotes != null && !lotes.isEmpty()) {
                    for (LoteDTO lote : lotes) {
                        Row row = sheet.createRow(rowIdx++);
                        row.createCell(0).setCellValue(lote.getId() != null ? lote.getId() : 0);
                        row.createCell(1).setCellValue(lote.getNombre() != null ? lote.getNombre() : "S/N");
                        row.createCell(2).setCellValue(lote.getExtensionHectareas() != null ? lote.getExtensionHectareas() : 0.0);
                        row.createCell(3).setCellValue(lote.getEtapaDesarrollo() != null ? lote.getEtapaDesarrollo() : "N/A");
                        row.createCell(4).setCellValue((lote.getCultivo() != null && lote.getCultivo().getNombre() != null) 
                                ? lote.getCultivo().getNombre() : "N/A");
                    }
                } else {
                    log.warn("No lotes found for Excel report");
                    Row row = sheet.createRow(1);
                    row.createCell(0).setCellValue("No hay datos disponibles");
                }

                for (int i = 0; i < columns.length; i++) {
                    sheet.autoSizeColumn(i);
                }

                workbook.write(out);
                return out.toByteArray();
            }
        } catch (Exception e) {
            log.error("Error generating Lotes Excel report: {}", e.getMessage(), e);
            throw e;
        }
    }
}
