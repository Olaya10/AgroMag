package com.AgroMag.report_service.dto;

import lombok.Data;

@Data
public class InsumoDTO {
    private Long id;
    private String nombreComercial;
    private String tipo;
    private Double stockActual;
    private Double umbralCritico;
    private String unidadMedida;
}
