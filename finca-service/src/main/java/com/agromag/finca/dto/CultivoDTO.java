package com.agromag.finca.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CultivoDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private Integer diasCosecha;
    private String temperapturOptima;
    private String humidadOptima;
    private String imagen;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}
