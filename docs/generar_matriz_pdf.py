import os
import sys
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_footer(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 6.5)
        self.setFillColor(colors.HexColor("#666666"))
        
        # Center footer text
        if self._pageNumber == 1:
            line1 = "Esta obra está licenciada bajo la Licencia Creative Commons Atribución-NoComercial-CompartirIgual 3.0 Unported."
            line2 = "G_ISO21500_Alc_P05_V1 - Matriz de Trazabilidad de Requisitos - Proyecto LocadedCar"
            self.drawCentredString(396, 26, line1)
            self.drawCentredString(396, 17, line2)
        else:
            line1 = "Esta obra está licenciada bajo la Licencia Creative Commons Atribución-NoComercial-CompartirIgual 3.0 Unported."
            line2 = "Para ver una copia de esta licencia, visita http://creativecommons.org/licenses/by-nc-sa/3.0/"
            self.drawCentredString(396, 26, line1)
            self.drawCentredString(396, 17, line2)
            
        self.restoreState()

def build_pdf(filename="docs/matriz_trazabilidad_requisitos_llenada.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=28,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    header_title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor("#0f4c81"),
        alignment=1 # Center
    )
    
    header_left_style = ParagraphStyle(
        'HeaderLeft',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor("#0f4c81"),
        alignment=0
    )
    
    header_right_style = ParagraphStyle(
        'HeaderRight',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#222222"),
        alignment=2
    )

    sub_banner_style = ParagraphStyle(
        'SubBanner',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0f4c81"),
        spaceAfter=4
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#222222")
    )

    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=6.8,
        leading=8.5,
        textColor=colors.white,
        alignment=1
    )

    td_center = ParagraphStyle(
        'TableCellCenter',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.8,
        leading=8.5,
        textColor=colors.HexColor("#222222"),
        alignment=1
    )

    td_center_bold = ParagraphStyle(
        'TableCellCenterBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=6.8,
        leading=8.5,
        textColor=colors.HexColor("#222222"),
        alignment=1
    )

    td_left = ParagraphStyle(
        'TableCellLeft',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.8,
        leading=8.5,
        textColor=colors.HexColor("#222222"),
        alignment=0
    )

    td_left_bold = ParagraphStyle(
        'TableCellLeftBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=6.8,
        leading=8.5,
        textColor=colors.HexColor("#222222"),
        alignment=0
    )

    story = []

    # --- PAGE 1: HEADER ---
    top_hdr_data = [
        [
            Paragraph("<b>ISO-21500</b><br/><font size='6.5' color='#555555'>GESTIÓN DE PROYECTOS</font>", header_left_style),
            Paragraph("MATRIZ DE TRAZABILIDAD DE REQUISITOS", header_title_style),
            Paragraph("<b>G_ISO21500_Alc_P05_V1</b><br/><font size='6.5' color='#555555'>PÁG. 1 DE 2</font>", header_right_style)
        ]
    ]
    top_hdr_table = Table(top_hdr_data, colWidths=[160, 400, 160])
    top_hdr_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(top_hdr_table)
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor("#0f4c81"), spaceBefore=2, spaceAfter=5))

    # --- METADATA TABLE ---
    meta_data = [
        [
            Paragraph("<b>TÍTULO DEL PROYECTO:</b> LocadedCar (Plataforma Premium de Exhibición y Venta de Autos Deportivos)", meta_label),
            Paragraph("<b>Fecha edición:</b> 10/09/2026", meta_label)
        ],
        [
            Paragraph("<b>Organización / Responsable:</b> BYTE-FORCE / Equipo de Ingeniería y Desarrollo Web", meta_label),
            Paragraph("<b>Código Proyecto:</b> PRJ-LOCADEDCAR-2026", meta_label)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[520, 200])
    meta_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#c0c0c0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e0e0e0")),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 5))

    story.append(Paragraph("ESTADO DE LOS REQUISITOS DEL PROYECTO (APLICACIÓN Y DESARROLLO TÉCNICO)", sub_banner_style))

    # --- MAIN REQUIREMENTS TABLE ---
    # Widths sum to 720 pt
    # Col 0: ID (42)
    # Col 1: REQUISITO (115)
    # Col 2: TIPO (58)
    # Col 3: PRIO (38)
    # Col 4: ESTADO (42)
    # Col 5: OBJETIVO TÉCNICO / NEGOCIO (170)
    # Col 6: ENTREGABLE(s) TÉCNICO (125)
    # Col 7: ESTADO Entreg (52)
    # Col 8: VALIDACIÓN (78)
    col_widths = [42, 115, 58, 38, 42, 170, 125, 52, 78]

    table_data = [
        [
            Paragraph("ID", th_style),
            Paragraph("REQUISITO", th_style),
            Paragraph("TIPO", th_style),
            Paragraph("PRIO", th_style),
            Paragraph("ESTADO", th_style),
            Paragraph("OBJETIVO TÉCNICO / NEGOCIO", th_style),
            Paragraph("ENTREGABLE(s) TÉCNICO", th_style),
            Paragraph("ESTADO<br/>(Entreg.)", th_style),
            Paragraph("VALIDACIÓN<br/>(persona/fecha)", th_style),
        ]
    ]

    rows = [
        (
            "RF-01",
            "<b>Catálogo interactivo</b>",
            "Funcional",
            "Alta",
            "Activo",
            "React Server Components (RSC) consumiendo Prisma ORM, mapeando vehículos deportivos con formateo de divisas Intl (MXN) y filtrado reactivo por estado de disponibilidad.",
            "Módulo Catálogo (/catalogo, CatalogGrid.tsx, CarCard.tsx)",
            "Aceptado",
            "BYTE-FORCE<br/>10/09/2026"
        ),
        (
            "RF-02",
            "<b>Ficha de detalle y selector de color</b>",
            "Funcional",
            "Alta",
            "Activo",
            "Construir vista dinámica (/catalogo/[id]) con selector interactivo de color HEX en tiempo real, renderizado de ficha técnica y visor multimedia Three.js / R3F estilo Apple Liquid Glass.",
            "Vista Detalle & Visor (/catalogo/[id], CarMediaViewer.tsx)",
            "Aceptado",
            "BYTE-FORCE<br/>10/09/2026"
        ),
        (
            "RF-03",
            "<b>Panel administrativo CRUD de inventario</b>",
            "Funcional",
            "Alta",
            "Activo",
            "Registrar, listar, editar y dar de baja unidades (marca, modelo, año, precio, clasificación deportiva y URLs de galería) con gestión en tiempo real sin despliegues manuales.",
            "Módulo Admin Inventario (/admin/inventario/page.tsx)",
            "Aceptado",
            "BYTE-FORCE<br/>10/09/2026"
        ),
        (
            "RF-04",
            "<b>Módulo CRM de administración de clientes</b>",
            "Funcional",
            "Media",
            "Activo",
            "Registrar prospectos, almacenar canales de contacto directo (correo/teléfono con enlaces mailto/tel) y vincular cotizaciones de compra para seguimiento comercial inmediato.",
            "Módulo CRM Clientes (/admin/clientes/page.tsx)",
            "Aceptado",
            "BYTE-FORCE<br/>10/09/2026"
        ),
        (
            "RF-05",
            "<b>Formulario de contacto y cotización VIP</b>",
            "Funcional",
            "Media",
            "Activo",
            "Capturar leads calificados de compradores interesados con validación reactiva de campos obligatorios y enrutamiento hacia el equipo de ventas comerciales.",
            "Formulario de Contacto (/contacto/page.tsx)",
            "Aceptado",
            "BYTE-FORCE<br/>10/09/2026"
        ),
        (
            "RT-01",
            "<b>Base de datos relacional y modelo ORM</b>",
            "No Funcional",
            "Alta",
            "Activo",
            "Modelar y migrar base de datos con Prisma ORM (Vehiculo, Cliente, Vendedor, Transaccion, ColorVariante) garantizando integridad referencial mediante claves foráneas y seeds automáticos.",
            "Capa de Datos Prisma (prisma/schema.prisma, seed.ts, dev.db)",
            "Aceptado",
            "BYTE-FORCE<br/>10/09/2026"
        ),
        (
            "RT-02",
            "<b>Arquitectura Next.js 16 y compilación</b>",
            "No Funcional",
            "Alta",
            "Activo",
            "Configurar arquitectura Next.js 16 con App Router, bundling Turbopack, tipado estricto TypeScript y compilación de producción para optimizar Core Web Vitals, SEO y escalabilidad.",
            "Configuración y Build (next.config.ts, tsconfig.json, .next/)",
            "Aceptado",
            "BYTE-FORCE<br/>10/09/2026"
        ),
        (
            "RNF-01",
            "<b>Sistema de diseño Glassmorphism y UX</b>",
            "No Funcional",
            "Alta",
            "Activo",
            "Aplicar sistema visual de superlujo automotriz con Tailwind CSS v4 (componentes translúcidos con backdrop-blur, gradientes sutiles) y micro-interacciones suaves con Framer Motion.",
            "Estilos y Componentes (globals.css, Navbar.tsx, Hero.tsx)",
            "Aceptado",
            "BYTE-FORCE<br/>10/09/2026"
        ),
        (
            "RNF-02",
            "<b>Control transaccional y consistencia contable</b>",
            "No Funcional",
            "Media",
            "Activo",
            "Estructurar control transaccional asociando cliente, vehículo y vendedor mediante transacciones atómicas para prevenir inconsistencias, evitar compras dobles y asegurar auditoría.",
            "Modelo Transaccion y Relaciones en ORM",
            "Aceptado",
            "BYTE-FORCE<br/>10/09/2026"
        ),
    ]

    for row in rows:
        table_data.append([
            Paragraph(row[0], td_center_bold),
            Paragraph(row[1], td_left),
            Paragraph(row[2], td_center_bold),
            Paragraph(row[3], td_center),
            Paragraph(row[4], td_center),
            Paragraph(row[5], td_left),
            Paragraph(row[6], td_left),
            Paragraph(row[7], td_center),
            Paragraph(row[8], td_center),
        ])

    main_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    t_style = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1a5276")),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor("#c5d1d9")),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]

    # Alternating row background colors
    for i in range(1, len(table_data)):
        if i % 2 == 0:
            t_style.append(('BACKGROUND', (0, i), (-1, i), colors.HexColor("#f8fafc")))
        else:
            t_style.append(('BACKGROUND', (0, i), (-1, i), colors.white))

    main_table.setStyle(TableStyle(t_style))
    story.append(main_table)

    # --- PAGE 2: ANEXO ---
    story.append(PageBreak())

    top_hdr_data2 = [
        [
            Paragraph("<b>ISO-21500</b><br/><font size='6.5' color='#555555'>GESTIÓN DE PROYECTOS</font>", header_left_style),
            Paragraph("REQUISITOS DEL PROYECTO", header_title_style),
            Paragraph("<b>G_ISO21500_Alc_P04_V1</b><br/><font size='6.5' color='#555555'>PÁG. 2 DE 2</font>", header_right_style)
        ]
    ]
    top_hdr_table2 = Table(top_hdr_data2, colWidths=[160, 400, 160])
    top_hdr_table2.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(top_hdr_table2)
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor("#0f4c81"), spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("ANEXO – Referencias y conceptos técnicos aplicados a LocadedCar", sub_banner_style))
    story.append(Spacer(1, 4))

    anexo_data = [
        [
            Paragraph("ID", td_left_bold),
            Paragraph("Identificador único asignado al requisito (RF: Requisito Funcional, RT: Requisito Técnico, RNF: Requisito No Funcional).", td_left)
        ],
        [
            Paragraph("TIPO", td_left_bold),
            Paragraph("Clasificación formal del requisito de software según estándares de ingeniería: exclusivamente <b>Funcional</b> (capacidades y funciones del sistema) o <b>No Funcional</b> (rendimiento, seguridad, arquitectura, persistencia y calidad UX).", td_left)
        ],
        [
            Paragraph("PRIORIDAD (PRIO)", td_left_bold),
            Paragraph("Grado de criticidad técnica para el despliegue funcional en producción (Alta, Media, Baja).", td_left)
        ],
        [
            Paragraph("ESTADO (del requisito)", td_left_bold),
            Paragraph("Situación en el ciclo de vida del desarrollo: 'Activo' (vigente, desarrollado e integrado en el código base).", td_left)
        ],
        [
            Paragraph("OBJETIVO TÉCNICO", td_left_bold),
            Paragraph("Especificación técnica de implementación, rendimiento, arquitectura o experiencia que orienta y justifica el desarrollo del requisito.", td_left)
        ],
        [
            Paragraph("ENTREGABLE TÉCNICO", td_left_bold),
            Paragraph("Artefacto de software verificable (archivos de código TypeScript, esquemas Prisma, componentes React, rutas Next.js).", td_left)
        ],
        [
            Paragraph("ESTADO (del entregable)", td_left_bold),
            Paragraph("Condición de despliegue del componente: 'Aceptado' (construido con éxito en next build y en ejecución en localhost).", td_left)
        ],
        [
            Paragraph("VALIDACIÓN", td_left_bold),
            Paragraph("Registro de equipo responsable y fecha en que se corroboró el funcionamiento y despliegue del artefacto.", td_left)
        ],
    ]

    anexo_table = Table(anexo_data, colWidths=[150, 570])
    anexo_style = [
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#b0c4de")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e6edf2")),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]
    for i in range(len(anexo_data)):
        if i % 2 == 1:
            anexo_style.append(('BACKGROUND', (0, i), (-1, i), colors.HexColor("#f8fafc")))
        else:
            anexo_style.append(('BACKGROUND', (0, i), (-1, i), colors.white))

    anexo_table.setStyle(TableStyle(anexo_style))
    story.append(anexo_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {filename}")

if __name__ == "__main__":
    out_pdf = sys.argv[1] if len(sys.argv) > 1 else "docs/matriz_trazabilidad_requisitos_llenada.pdf"
    build_pdf(out_pdf)
