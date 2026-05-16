package com.agromag.finca.dto;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
public class RiegoDTO {
    private Long id;
    private LocalDateTime fechaHora;
    private Double cantidadAguaLitros;
    private String observaciones;

    @JsonIgnoreProperties({"imagen", "finca", "cultivo"})
    private LoteDTO lote;

    @JsonIgnoreProperties({"imagen"})
    private CultivoDTO cultivo;
}
