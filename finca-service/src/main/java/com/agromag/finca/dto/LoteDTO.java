package com.agromag.finca.dto;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
public class LoteDTO {
    private Long id;
    private String nombre;
    private Double extensionHectareas;
    private String coordenadas;
    private String etapaDesarrollo;
    private String observaciones;
    private String imagen;
    
    @JsonIgnoreProperties({"imagen"})
    private FincaDTO finca;
    
    @JsonIgnoreProperties({"imagen"})
    private CultivoDTO cultivo;
    
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}
