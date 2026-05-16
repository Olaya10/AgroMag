package com.agromag.finca.dto;
import com.agromag.finca.entities.*;

public class FincaMapper {
    
    public static FincaDTO toDTO(Finca entity) {
        if (entity == null) return null;
        FincaDTO dto = new FincaDTO();
        dto.setId(entity.getId());
        dto.setNombre(entity.getNombre());
        dto.setUbicacion(entity.getUbicacion());
        dto.setTamanoHectareas(entity.getTamanoHectareas());
        dto.setDescripcion(entity.getDescripcion());
        dto.setImagen(entity.getImagen());
        dto.setActivo(entity.getActivo());
        dto.setFechaCreacion(entity.getFechaCreacion());
        dto.setFechaActualizacion(entity.getFechaActualizacion());
        return dto;
    }

    public static Finca toEntity(FincaDTO dto) {
        if (dto == null) return null;
        Finca entity = new Finca();
        entity.setId(dto.getId());
        entity.setNombre(dto.getNombre());
        entity.setUbicacion(dto.getUbicacion());
        entity.setTamanoHectareas(dto.getTamanoHectareas());
        entity.setDescripcion(dto.getDescripcion());
        entity.setImagen(dto.getImagen());
        entity.setActivo(dto.getActivo());
        return entity;
    }
    
    public static CultivoDTO toDTO(Cultivo entity) {
        if (entity == null) return null;
        CultivoDTO dto = new CultivoDTO();
        dto.setId(entity.getId());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setDiasCosecha(entity.getDiasCosecha());
        dto.setTemperapturOptima(entity.getTemperapturOptima());
        dto.setHumidadOptima(entity.getHumidadOptima());
        dto.setImagen(entity.getImagen());
        dto.setActivo(entity.getActivo());
        dto.setFechaCreacion(entity.getFechaCreacion());
        dto.setFechaActualizacion(entity.getFechaActualizacion());
        return dto;
    }
    
    public static Cultivo toEntity(CultivoDTO dto) {
        if (dto == null) return null;
        Cultivo entity = new Cultivo();
        entity.setId(dto.getId());
        entity.setNombre(dto.getNombre());
        entity.setDescripcion(dto.getDescripcion());
        entity.setDiasCosecha(dto.getDiasCosecha());
        entity.setTemperapturOptima(dto.getTemperapturOptima());
        entity.setHumidadOptima(dto.getHumidadOptima());
        entity.setImagen(dto.getImagen());
        entity.setActivo(dto.getActivo());
        return entity;
    }

    public static LoteDTO toDTO(Lote entity) {
        if (entity == null) return null;
        LoteDTO dto = new LoteDTO();
        dto.setId(entity.getId());
        dto.setNombre(entity.getNombre());
        dto.setExtensionHectareas(entity.getExtensionHectareas());
        dto.setCoordenadas(entity.getCoordenadas());
        dto.setEtapaDesarrollo(entity.getEtapaDesarrollo());
        dto.setObservaciones(entity.getObservaciones());
        dto.setImagen(entity.getImagen());
        dto.setFinca(toDTO(entity.getFinca()));
        dto.setCultivo(toDTO(entity.getCultivo()));
        dto.setFechaCreacion(entity.getFechaCreacion());
        dto.setFechaActualizacion(entity.getFechaActualizacion());
        return dto;
    }

    public static Lote toEntity(LoteDTO dto) {
        if (dto == null) return null;
        Lote entity = new Lote();
        entity.setId(dto.getId());
        entity.setNombre(dto.getNombre());
        entity.setExtensionHectareas(dto.getExtensionHectareas());
        entity.setCoordenadas(dto.getCoordenadas());
        entity.setEtapaDesarrollo(dto.getEtapaDesarrollo());
        entity.setObservaciones(dto.getObservaciones());
        entity.setImagen(dto.getImagen());
        entity.setFinca(toEntity(dto.getFinca()));
        entity.setCultivo(toEntity(dto.getCultivo()));
        return entity;
    }

    public static NovedadDTO toDTO(Novedad entity) {
        if (entity == null) return null;
        NovedadDTO dto = new NovedadDTO();
        dto.setId(entity.getId());
        dto.setTitulo(entity.getTitulo());
        dto.setDescripcion(entity.getDescripcion());
        dto.setFotoUrl(entity.getFotoUrl());
        dto.setFecha(entity.getFecha());
        dto.setLote(toDTO(entity.getLote()));
        return dto;
    }
    
    public static Novedad toEntity(NovedadDTO dto) {
        if (dto == null) return null;
        Novedad entity = new Novedad();
        entity.setId(dto.getId());
        entity.setTitulo(dto.getTitulo());
        entity.setDescripcion(dto.getDescripcion());
        entity.setFotoUrl(dto.getFotoUrl());
        entity.setFecha(dto.getFecha());
        entity.setLote(toEntity(dto.getLote()));
        return entity;
    }

    public static RiegoDTO toDTO(Riego entity) {
        if (entity == null) return null;
        RiegoDTO dto = new RiegoDTO();
        dto.setId(entity.getId());
        dto.setFechaHora(entity.getFechaHora());
        dto.setCantidadAguaLitros(entity.getCantidadAguaLitros());
        dto.setObservaciones(entity.getObservaciones());
        dto.setLote(toDTO(entity.getLote()));
        dto.setCultivo(toDTO(entity.getCultivo()));
        return dto;
    }

    public static Riego toEntity(RiegoDTO dto) {
        if (dto == null) return null;
        Riego entity = new Riego();
        entity.setId(dto.getId());
        entity.setFechaHora(dto.getFechaHora());
        entity.setCantidadAguaLitros(dto.getCantidadAguaLitros());
        entity.setObservaciones(dto.getObservaciones());
        entity.setLote(toEntity(dto.getLote()));
        entity.setCultivo(toEntity(dto.getCultivo()));
        return entity;
    }
}
