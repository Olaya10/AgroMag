package com.AgroMag.report_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RiegoDTO {
    private Long id;
    private LocalDateTime fechaHora;
    private Double cantidadAguaLitros;
    private String observaciones;
    private LoteDTO lote;
    private CultivoDTO cultivo;
}
