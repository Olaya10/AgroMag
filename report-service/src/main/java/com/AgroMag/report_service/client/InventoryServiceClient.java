package com.AgroMag.report_service.client;

import com.AgroMag.report_service.dto.AplicacionDTO;
import com.AgroMag.report_service.dto.InsumoDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "inventory-service", url = "${inventory-service.url:http://localhost:8082}", fallback = InventoryServiceFallback.class)
public interface InventoryServiceClient {

    @GetMapping("/bodega/insumos")
    List<InsumoDTO> getAllInsumos();

    @GetMapping("/bodega/aplicaciones")
    List<AplicacionDTO> getAllAplicaciones();
}
