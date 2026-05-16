package com.agromag.inventory.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AplicacionDTO {
    private Long id;
    private Long loteId;
    private Long operarioId;
    private Double dosis;
    private LocalDateTime fecha;
    private InsumoDTO insumo;
}
