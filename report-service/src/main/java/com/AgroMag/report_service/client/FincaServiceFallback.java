package com.AgroMag.report_service.client;

import com.AgroMag.report_service.dto.CultivoDTO;
import com.AgroMag.report_service.dto.FincaDTO;
import com.AgroMag.report_service.dto.LoteDTO;
import com.AgroMag.report_service.dto.RiegoDTO;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class FincaServiceFallback implements FincaServiceClient {
    @Override
    public List<FincaDTO> getAllFincas() { return Collections.emptyList(); }
    @Override
    public List<LoteDTO> getAllLotes() { return Collections.emptyList(); }
    @Override
    public List<CultivoDTO> getAllCultivos() { return Collections.emptyList(); }
    @Override
    public List<RiegoDTO> getAllRiegos() { return Collections.emptyList(); }
    @Override
    public List<LoteDTO> getLotesByFinca(Long fincaId) { return Collections.emptyList(); }
}
