package com.AgroMag.report_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CultivoDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private Integer diasCosecha;
    private Double temperapturOptima;
    private Double humidadOptima;
    private Boolean activo;
}
