package com.agromag.inventory.dto;
import com.agromag.inventory.entities.*;

public class InventoryMapper {
    
    public static InsumoDTO toDTO(Insumo entity) {
        if (entity == null) return null;
        InsumoDTO dto = new InsumoDTO();
        dto.setId(entity.getId());
        dto.setNombreComercial(entity.getNombreComercial());
        dto.setTipo(entity.getTipo());
        dto.setStockActual(entity.getStockActual());
        dto.setUmbralCritico(entity.getUmbralCritico());
        dto.setUnidadMedida(entity.getUnidadMedida());
        return dto;
    }

    public static Insumo toEntity(InsumoDTO dto) {
        if (dto == null) return null;
        Insumo entity = new Insumo();
        entity.setId(dto.getId());
        entity.setNombreComercial(dto.getNombreComercial());
        entity.setTipo(dto.getTipo());
        entity.setStockActual(dto.getStockActual());
        entity.setUmbralCritico(dto.getUmbralCritico());
        entity.setUnidadMedida(dto.getUnidadMedida());
        return entity;
    }

    public static AplicacionDTO toDTO(Aplicacion entity) {
        if (entity == null) return null;
        AplicacionDTO dto = new AplicacionDTO();
        dto.setId(entity.getId());
        dto.setLoteId(entity.getLoteId());
        dto.setOperarioId(entity.getOperarioId());
        dto.setDosis(entity.getDosis());
        dto.setFecha(entity.getFecha());
        dto.setInsumo(toDTO(entity.getInsumo()));
        return dto;
    }
    
    public static Aplicacion toEntity(AplicacionDTO dto) {
        if (dto == null) return null;
        Aplicacion entity = new Aplicacion();
        entity.setId(dto.getId());
        entity.setLoteId(dto.getLoteId());
        entity.setOperarioId(dto.getOperarioId());
        entity.setDosis(dto.getDosis());
        entity.setFecha(dto.getFecha());
        entity.setInsumo(toEntity(dto.getInsumo()));
        return entity;
    }
}
