package com.AgroMag.report_service.service;

import com.AgroMag.report_service.client.FincaServiceClient;
import com.AgroMag.report_service.dto.LoteDTO;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRMapCollectionDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service("pdfReportService")
public class PdfReportServiceImpl implements ReportService {

    private static final Logger log = LoggerFactory.getLogger(PdfReportServiceImpl.class);
    
    @Autowired
    private FincaServiceClient fincaClient;

    // Cache for compiled reports to improve performance (Senior Best Practice)
    private final Map<String, JasperReport> reportCache = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        log.info("Initializing PDF Report Service and pre-compiling templates...");
        try {
            getCompiledReport("reporte_lotes.jrxml");
        } catch (Exception e) {
            log.error("Failed to pre-compile Jasper templates: {}", e.getMessage());
        }
    }

    private JasperReport getCompiledReport(String templateName) throws JRException, java.io.IOException {
        if (reportCache.containsKey(templateName)) {
            return reportCache.get(templateName);
        }

        log.info("Compiling Jasper template: {}", templateName);
        try (InputStream jrxmlInput = new ClassPathResource(templateName).getInputStream()) {
            JasperReport compiledReport = JasperCompileManager.compileReport(jrxmlInput);
            reportCache.put(templateName, compiledReport);
            return compiledReport;
        }
    }

    @Override
    public byte[] generateLotesReport() throws Exception {
        log.info("Generating PDF report for Lotes");
        try {
            List<LoteDTO> lotes = fincaClient.getAllLotes();
            if (lotes == null || lotes.isEmpty()) {
                log.warn("No lotes found to generate report, returning empty report");
                lotes = new ArrayList<>(); // Use empty list instead of null
            }
            
            Collection<Map<String, ?>> lotesData = new ArrayList<>();
            for (LoteDTO lote : lotes) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", lote.getId());
                item.put("nombre", lote.getNombre() != null ? lote.getNombre() : "S/N");
                item.put("extensionHectareas", lote.getExtensionHectareas() != null ? lote.getExtensionHectareas() : 0.0);
                item.put("etapaDesarrollo", lote.getEtapaDesarrollo() != null ? lote.getEtapaDesarrollo() : "N/A");
                item.put("cultivoNombre", (lote.getCultivo() != null && lote.getCultivo().getNombre() != null) 
                        ? lote.getCultivo().getNombre() : "N/A");
                lotesData.add(item);
            }

            JasperReport jasperReport = getCompiledReport("reporte_lotes.jrxml");
            
            // Even if empty, Jasper can show the headers if configured or just an empty table
            JRMapCollectionDataSource dataSource = new JRMapCollectionDataSource(lotesData);
            
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("createdBy", "AgroMag Report Service");
            
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);
            return JasperExportManager.exportReportToPdf(jasperPrint);
        } catch (Exception e) {
            log.error("Error generating Lotes PDF report: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating PDF report: " + e.getMessage());
        }
    }

    @Override
    public byte[] generateInventoryReport() throws Exception {
        throw new UnsupportedOperationException("Inventory PDF report not implemented yet");
    }
}
