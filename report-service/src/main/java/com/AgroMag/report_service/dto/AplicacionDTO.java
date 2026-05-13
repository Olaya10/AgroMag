package com.AgroMag.report_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AplicacionDTO {
    private Long id;
    private Long loteId;
    private Double dosis;
    private LocalDateTime fecha;
    private InsumoDTO insumo;
}
