package com.AgroMag.report_service.dto;
import lombok.Data;
import java.util.List;

@Data
public class DashboardMetricsDTO {
    private Integer totalRegistros;
    private Integer alertasPendientes;
    private UltimaAplicacionDTO ultimaAplicacion;
    private CostosConsolidadosDTO costosConsolidados;
    private RentabilidadDTO rentabilidadEstimada;
    private CalendarioDTO calendarioAgricola;
    private List<RiegoChartDTO> riegosRecientesChart;
    private List<RiegoItemDTO> ultimosRiegos;
    private List<AplicacionItemDTO> ultimasAplicaciones;

    @Data public static class UltimaAplicacionDTO {
        private String insumoNombre;
        private Double dosis;
        private String fecha;
    }

    @Data public static class CostosConsolidadosDTO {
        private Double fertilizantes;
        private Double pesticidas;
        private Double otros;
        private Double total;
    }

    @Data public static class RentabilidadDTO {
        private Double ingresoBruto;
        private Double costosOperativos;
        private Double utilidadNeta;
        private String roi;
    }

    @Data public static class CalendarioDTO {
        private String mesActual;
        private String sugerencia;
    }

    @Data public static class RiegoChartDTO {
        private Long id;
        private Double ejecutado;
        private Double programado;
        private String fechaCorta;
    }

    @Data public static class RiegoItemDTO {
        private Long id;
        private String loteNombre;
        private String fecha;
        private Double cantidad;
        private String observaciones;
    }

    @Data public static class AplicacionItemDTO {
        private Long id;
        private String insumoNombre;
        private String fecha;
        private Double dosis;
        private String loteNombre;
        private String fincaNombre;
    }
}
