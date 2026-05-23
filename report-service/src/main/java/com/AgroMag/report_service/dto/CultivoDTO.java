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
    private String temperaturaOptima;
    private String humedadOptima;

    public String getTemperaturaOptima() {
        return temperaturaOptima;
    }

    public void setTemperaturaOptima(String temperaturaOptima) {
        this.temperaturaOptima = temperaturaOptima;
    }

    public String getHumedadOptima() {
        return humedadOptima;
    }

    public void setHumedadOptima(String humedadOptima) {
        this.humedadOptima = humedadOptima;
    }
    private Boolean activo;
}
