package com.AgroMag.report_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class LoteDTO {
    private Long id;
    private String nombre;
    private Double extensionHectareas;
    private String etapaDesarrollo;
    private FincaDTO finca;
    private CultivoDTO cultivo;
}
