package com.AgroMag.report_service.dto;

import lombok.Data;

@Data
public class LoteDTO {
    private Long id;
    private String nombre;
    private Double extensionHectareas;
    private String etapaDesarrollo;
    private FincaDTO finca;
    private CultivoDTO cultivo;
}
