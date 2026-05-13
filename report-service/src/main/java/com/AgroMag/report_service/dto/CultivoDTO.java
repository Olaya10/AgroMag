package com.AgroMag.report_service.dto;

import lombok.Data;

@Data
public class CultivoDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private Integer diasCosecha;
    private Double temperapturOptima;
    private Double humidadOptima;
    private Boolean activo;
}
