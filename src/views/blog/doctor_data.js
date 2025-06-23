const doctors = [
  { id: 1, name: 'Bác sĩ A' },
  { id: 2, name: 'Bác sĩ B' },
  { id: 3, name: 'Bác sĩ C' },
  { id: 4, name: 'Bác sĩ D' }
];
const selectElement = document.getElementById('doctorSelect');

        // Duyệt qua danh sách bác sĩ và thêm vào dropdown
        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = doctor.name;
            selectElement.appendChild(option);
        });