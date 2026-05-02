package com.agromag.finca.services;

import com.agromag.finca.entities.Cultivo;
import com.agromag.finca.repositories.CultivoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CultivoService {

    @Autowired
    private CultivoRepository cultivoRepository;

    public List<Cultivo> listarActivos() {
        return cultivoRepository.findByActivoTrue();
    }

    public List<Cultivo> listarTodos() {
        return cultivoRepository.findAll();
    }

    public Cultivo obtenerPorId(Long id) throws Exception {
        return cultivoRepository.findById(id)
                .orElseThrow(() -> new Exception("Cultivo no encontrado"));
    }

    public Cultivo guardar(Cultivo cultivo) throws Exception {
        if (cultivo.getNombre() == null || cultivo.getNombre().isEmpty()) {
            throw new Exception("El nombre del cultivo es requerido");
        }
        
        Cultivo existente = cultivoRepository.findByNombreIgnoreCase(cultivo.getNombre());
        if (existente != null && !existente.getId().equals(cultivo.getId())) {
            throw new Exception("Ya existe un cultivo con ese nombre");
        }
        
        return cultivoRepository.save(cultivo);
    }

    public Cultivo actualizar(Long id, Cultivo detalles) throws Exception {
        Cultivo cultivo = cultivoRepository.findById(id)
                .orElseThrow(() -> new Exception("Cultivo no encontrado"));

        cultivo.setNombre(detalles.getNombre());
        cultivo.setDescripcion(detalles.getDescripcion());
        cultivo.setDiasCosecha(detalles.getDiasCosecha());
        cultivo.setTemperapturOptima(detalles.getTemperapturOptima());
        cultivo.setHumidadOptima(detalles.getHumidadOptima());
        
        if (detalles.getImagen() != null) {
            cultivo.setImagen(detalles.getImagen());
        }
        
        cultivo.setActivo(detalles.getActivo());

        return cultivoRepository.save(cultivo);
    }

    public void eliminar(Long id) throws Exception {
        Cultivo cultivo = cultivoRepository.findById(id)
                .orElseThrow(() -> new Exception("Cultivo no encontrado"));
        cultivoRepository.delete(cultivo);
    }

    public void desactivar(Long id) throws Exception {
        Cultivo cultivo = cultivoRepository.findById(id)
                .orElseThrow(() -> new Exception("Cultivo no encontrado"));
        cultivo.setActivo(false);
        cultivoRepository.save(cultivo);
    }
}
