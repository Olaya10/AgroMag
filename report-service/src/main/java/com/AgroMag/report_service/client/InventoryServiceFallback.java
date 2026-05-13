package com.AgroMag.report_service.client;

import com.AgroMag.report_service.dto.AplicacionDTO;
import com.AgroMag.report_service.dto.InsumoDTO;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class InventoryServiceFallback implements InventoryServiceClient {
    @Override
    public List<InsumoDTO> getAllInsumos() { return Collections.emptyList(); }
    @Override
    public List<AplicacionDTO> getAllAplicaciones() { return Collections.emptyList(); }
}
