package com.agromag.finca.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
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
    private String imagen;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}
