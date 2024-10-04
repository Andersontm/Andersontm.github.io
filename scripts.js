document.querySelectorAll('.estado').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.estado');
        let countSolido = 0;
        let countDeteriorado = 0;
        let countRuinoso = 0;
        let totalChecked = 0;

        // Contar los checkboxes seleccionados de cada tipo de estado
        checkboxes.forEach(box => {
            if (box.checked) {
                totalChecked++;
                if (box.getAttribute('data-estado') === 'solido') {
                    countSolido++;
                } else if (box.getAttribute('data-estado') === 'deteriorado') {
                    countDeteriorado++;
                } else if (box.getAttribute('data-estado') === 'ruinoso') {
                    countRuinoso++;
                }
            }
        });

        const estadoGeneral = document.getElementById('estado-general');
        
        // Decidir el estado general según la mayor cantidad de checkboxes seleccionados
        if (countRuinoso > countDeteriorado && countRuinoso > countSolido) {
            estadoGeneral.textContent = 'Ruinoso';
        } else if (countDeteriorado > countSolido) {
            estadoGeneral.textContent = 'Deteriorado';
        } else if (countSolido > 0) {
            estadoGeneral.textContent = 'Sólido';
        } else {
            estadoGeneral.textContent = ''; // Sin selección
        }
    });
});

//pdf
document.getElementById('generate-pdf').addEventListener('click', function() {
    const element = document.querySelector('.container');

    // Guardar los placeholders originales
    const inputs = document.querySelectorAll('input[type="text"]');
    const placeholders = [];

    // Remover placeholders temporalmente
    inputs.forEach((input, index) => {
        placeholders[index] = input.getAttribute('placeholder'); // Guardamos el placeholder actual
        input.setAttribute('placeholder', ''); // Quitamos el placeholder temporalmente
    });

    // Guardar el estilo original de la columna de "Estado General"
    const estadoGeneralCol = document.getElementById('estado-general');
    const originalStyle = estadoGeneralCol.style.cssText;

    // Modificar temporalmente el estilo para que el texto no esté rotado
    estadoGeneralCol.style.writingMode = 'horizontal-tb';
    estadoGeneralCol.style.transform = 'rotate(0deg)';
    estadoGeneralCol.style.textAlign = 'center';

    // Usamos html2canvas para capturar el contenido
    html2canvas(element, { 
        scale: 2,
        useCORS: true
    }).then(function(canvas) {
        const imgData = canvas.toDataURL('image/png');

        // Asegúrate de acceder correctamente al módulo UMD de jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'pt', 'a4');
        const imgWidth = 595.28;
        const pageHeight = 841.89;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Agregar la imagen principal al PDF
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Si el contenido es más grande que una página A4, añade nuevas páginas
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('formulario_datos.pdf');

        // Restaurar los placeholders originales después de generar el PDF
        inputs.forEach((input, index) => {
            input.setAttribute('placeholder', placeholders[index]); // Restauramos el placeholder original
        });

        // Restaurar el estilo original de la columna "Estado General"
        estadoGeneralCol.style.cssText = originalStyle;
    });
});
