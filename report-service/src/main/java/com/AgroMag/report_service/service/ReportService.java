package com.AgroMag.report_service.service;

public interface ReportService {
    byte[] generateLotesReport() throws Exception;
    byte[] generateInventoryReport() throws Exception;
}
