package com.agromag.finca.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FincaDTO {
    private Long id;
    private String nombre;
    private String ubicacion;
    private Double tamanoHectareas;
    private String descripcion;
    private String imagen;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}
