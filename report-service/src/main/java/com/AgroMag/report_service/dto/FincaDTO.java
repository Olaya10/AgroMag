package com.AgroMag.report_service.dto;

import lombok.Data;

@Data
public class FincaDTO {
    private Long id;
    private String nombre;
    private String ubicacion;
    private Double tamanoHectareas;
    private String descripcion;
    private Boolean activo;
}
