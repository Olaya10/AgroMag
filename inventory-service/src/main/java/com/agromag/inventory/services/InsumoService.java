package com.agromag.inventory.services;

import com.agromag.inventory.entities.Insumo;
import com.agromag.inventory.entities.Aplicacion;
import com.agromag.inventory.repositories.InsumoRepository;
import com.agromag.inventory.repositories.AplicacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InsumoService {

    private final InsumoRepository insumoRepository;

    private final AplicacionRepository aplicacionRepository;

    @Transactional
    public Aplicacion registrarAplicacion(Aplicacion aplicacion) {
        // 1. Buscar el insumo en bodega
        Insumo insumo = insumoRepository.findById(aplicacion.getInsumo().getId())
                .orElseThrow(() -> new RuntimeException("Insumo no encontrado"));

        // 2. Descontar automáticamente del inventario
        if (insumo.getStockActual() < aplicacion.getDosis()) {
            throw new RuntimeException("Stock insuficiente para realizar la aplicación");
        }

        insumo.setStockActual(insumo.getStockActual() - aplicacion.getDosis());
        insumoRepository.save(insumo);

        // 3. Guardar el registro de la aplicación
        aplicacion.setFecha(LocalDateTime.now());
        return aplicacionRepository.save(aplicacion);
    }

    @Transactional
    public Aplicacion actualizarAplicacion(Long id, Aplicacion detalles) {
        Aplicacion existente = aplicacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aplicación no encontrada"));

        Insumo insumo = insumoRepository.findById(existente.getInsumo().getId())
                .orElseThrow(() -> new RuntimeException("Insumo asociado no encontrado"));

        // Recalcular stock: sumamos la dosis vieja y restamos la nueva
        double diferencia = detalles.getDosis() - existente.getDosis();
        
        if (insumo.getStockActual() < diferencia) {
            throw new RuntimeException("Stock insuficiente para actualizar la dosis");
        }

        insumo.setStockActual(insumo.getStockActual() - diferencia);
        insumoRepository.save(insumo);

        // Actualizar datos de la aplicación
        existente.setDosis(detalles.getDosis());
        existente.setLoteId(detalles.getLoteId());
        existente.setOperarioId(detalles.getOperarioId());
        existente.setFecha(detalles.getFecha() != null ? detalles.getFecha() : existente.getFecha());
        
        return aplicacionRepository.save(existente);
    }

    @Transactional
    public void eliminarAplicacion(Long id) {
        Aplicacion aplicacion = aplicacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aplicación no encontrada"));

        Insumo insumo = insumoRepository.findById(aplicacion.getInsumo().getId())
                .orElseThrow(() -> new RuntimeException("Insumo asociado no encontrado"));

        // Devolver el stock a la bodega
        insumo.setStockActual(insumo.getStockActual() + aplicacion.getDosis());
        insumoRepository.save(insumo);

        aplicacionRepository.delete(aplicacion);
    }

    public List<Aplicacion> listarAplicaciones() {
        return aplicacionRepository.findAll();
    }
}