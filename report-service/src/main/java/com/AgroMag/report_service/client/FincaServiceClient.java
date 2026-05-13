package com.AgroMag.report_service.client;

import com.AgroMag.report_service.dto.CultivoDTO;
import com.AgroMag.report_service.dto.FincaDTO;
import com.AgroMag.report_service.dto.LoteDTO;
import com.AgroMag.report_service.dto.RiegoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "finca-service", url = "${finca-service.url:http://localhost:8081}", fallback = FincaServiceFallback.class)
public interface FincaServiceClient {

    @GetMapping("/fincas")
    List<FincaDTO> getAllFincas();

    @GetMapping("/lotes")
    List<LoteDTO> getAllLotes();

    @GetMapping("/cultivos")
    List<CultivoDTO> getAllCultivos();

    @GetMapping("/riegos")
    List<RiegoDTO> getAllRiegos();

    @GetMapping("/lotes/finca/{fincaId}")
    List<LoteDTO> getLotesByFinca(@PathVariable("fincaId") Long fincaId);
}
