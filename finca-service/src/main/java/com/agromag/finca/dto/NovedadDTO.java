package com.agromag.finca.dto;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
public class NovedadDTO {
    private Long id;
    private String titulo;
    private String descripcion;
    private String fotoUrl;
    private LocalDateTime fecha;
    
    @JsonIgnoreProperties({"imagen", "observaciones", "coordenadas"})
    private LoteDTO lote;
}
