const fs = require("fs");

// Utility random helpers
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[rand(0, arr.length - 1)];

// Sample pools
const firstNames = ["Alice", "Bob", "Carol", "David", "Emma", "Frank", "Grace", "Henry", "James", "Nina", "Olivia", "Peter", "Robert", "Sophia", "Thomas", "Victor", "Wendy"];
const lastNames = ["Martinez", "Thompson", "Zhang", "Lee", "Brown", "Garcia", "Taylor", "Anderson", "Wilson", "Stevens", "Lopez", "Kim", "Patel", "Singh", "Carter", "Young"];

const roles = ["Engineer", "Senior Engineer", "Tech Lead", "Manager", "Director", "UX Designer", "QA Analyst", "DevOps Engineer", "Researcher", "Product Manager", "Account Executive", "Sales Rep", "Data Scientist"];

const departmentsList = [
  { name: "Engineering", budget: 2800000 },
  { name: "Product", budget: 1500000 },
  { name: "Sales", budget: 2000000 },
  { name: "Marketing", budget: 1100000 },
  { name: "Design", budget: 900000 },
  { name: "Research", budget: 3000000 },
  { name: "DevOps", budget: 1600000 },
  { name: "Customer Success", budget: 1300000 },
  { name: "Finance", budget: 1800000 },
  { name: "HR", budget: 700000 }
];

function generateEmployee(deptPrefix, idNum) {
  const first = pick(firstNames);
  const last = pick(lastNames);
  const role = pick(roles);
  const salary = rand(70000, 200000);

  return {
    id: `${deptPrefix}${String(idNum).padStart(3, "0")}`,
    name: `${first} ${last}`,
    role,
    salary,
    years: rand(1, 12)
  };
}

function generateDepartment(deptData, index) {
  const employeesCount = rand(50, 80); // Enough to push total lines past 1000
  const employees = [];

  for (let i = 1; i <= employeesCount; i++) {
    employees.push(generateEmployee(deptData.name[0], i));
  }

  const headName = `${pick(firstNames)} ${pick(lastNames)}`;

  return {
    name: deptData.name,
    budget: deptData.budget,
    head: headName,
    employees
  };
}

// Build the company
const company = {
  company: {
    name: "InnovateTech Solutions",
    founded: 2018,
    industry: "Software Development",
    headquarters: {
      city: "San Francisco",
      state: "California",
      country: "USA",
      address: "123 Innovation Drive"
    },
    departments: [],
    metrics: {}
  }
};

// Generate departments
let totalEmployees = 0;
let totalPayroll = 0;
let totalYears = 0;

departmentsList.forEach((dept, index) => {
  const d = generateDepartment(dept, index);
  company.company.departments.push(d);

  d.employees.forEach(emp => {
    totalEmployees++;
    totalPayroll += emp.salary;
    totalYears += emp.years;
  });
});

// Metrics
company.company.metrics = {
  total_departments: company.company.departments.length,
  total_employees: totalEmployees,
  total_payroll: totalPayroll,
  average_salary: Math.round(totalPayroll / totalEmployees),
  average_tenure: (totalYears / totalEmployees).toFixed(2)
};

// Save file
fs.writeFileSync("company_1000_lines.json", JSON.stringify(company, null, 4));

console.log("Generated company_1000_lines.json with ~1000+ lines!");