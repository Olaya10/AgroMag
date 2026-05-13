package com.AgroMag.report_service.controller;

import com.AgroMag.report_service.service.ReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private static final Logger log = LoggerFactory.getLogger(ReportController.class);

    @Autowired
    @Qualifier("excelReportService")
    private ReportService excelReportService;

    @Autowired
    @Qualifier("pdfReportService")
    private ReportService pdfReportService;

    @GetMapping("/inventory/excel")
    public ResponseEntity<byte[]> downloadInventoryExcel() throws Exception {
        log.info("REST request to download Inventory Excel report");
        byte[] data = excelReportService.generateInventoryReport();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=inventario.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/lotes/excel")
    public ResponseEntity<byte[]> downloadLotesExcel() throws Exception {
        log.info("REST request to download Lotes Excel report");
        byte[] data = excelReportService.generateLotesReport();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=lotes.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/lotes/pdf")
    public ResponseEntity<byte[]> downloadLotesPdf() throws Exception {
        log.info("REST request to download Lotes PDF report");
        byte[] data = pdfReportService.generateLotesReport();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte_lotes.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}
