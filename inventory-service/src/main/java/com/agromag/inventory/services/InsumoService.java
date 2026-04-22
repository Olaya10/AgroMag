package com.agromag.inventory.services;

import com.agromag.inventory.entities.Insumo;
import com.agromag.inventory.entities.Aplicacion;
import com.agromag.inventory.repositories.InsumoRepository;
import com.agromag.inventory.repositories.AplicacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class InsumoService {

    @Autowired
    private InsumoRepository insumoRepository;

    @Autowired
    private AplicacionRepository aplicacionRepository;

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

        // 3. Guardar el registro de la aplicación (RF17)
        aplicacion.setFecha(LocalDateTime.now());
        return aplicacionRepository.save(aplicacion);
    }
}