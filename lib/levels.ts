import { Level } from "@/types";

export const LEVELS: Level[] = [
  {
    id: "college-schema",
    title: "College Task: Build Core Schema",
    world: 1,
    type: "schema",
    description:
      "Create the college schema using SQL CREATE TABLE and INSERT statements",
    story:
      "You are building a college database. First write CREATE TABLE statements, then insert enough sample rows in every table.",
    expectedSchema: [
      {
        name: "department",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR", isNullable: false },
          { name: "building", type: "VARCHAR" },
        ],
      },
      {
        name: "student",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR", isNullable: false },
          { name: "email", type: "VARCHAR", isNullable: false },
          {
            name: "department_id",
            type: "INT",
            isForeign: true,
            references: { table: "department", column: "id" },
            isNullable: false,
          },
        ],
      },
      {
        name: "instructor",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR", isNullable: false },
          {
            name: "department_id",
            type: "INT",
            isForeign: true,
            references: { table: "department", column: "id" },
            isNullable: false,
          },
        ],
      },
      {
        name: "course",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR", isNullable: false },
          { name: "credits", type: "INT", isNullable: false },
          {
            name: "department_id",
            type: "INT",
            isForeign: true,
            references: { table: "department", column: "id" },
            isNullable: false,
          },
        ],
      },
    ],
    requiredInserts: {
      department: 3,
      student: 5,
      instructor: 3,
      course: 4,
    },
    hints: [
      "Create all 4 tables first, then add INSERT statements for each table.",
      "Use department as parent table and link student, instructor, and course with department_id.",
      "Each table must have enough rows inserted before this task is marked complete.",
    ],
    xp: 350,
  },
  {
    id: "college-query-select",
    title: "College Task: SQL Basics (SELECT *)",
    world: 1,
    type: "query",
    description: "Start with a simple SELECT query",
    story: "Return all rows from the student table.",
    schema: [
      {
        name: "student",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
          { name: "email", type: "VARCHAR" },
          { name: "department_id", type: "INT" },
        ],
      },
    ],
    sampleData: [
      {
        table: "student",
        values: {
          id: 1,
          name: "Anu",
          email: "anu@college.edu",
          department_id: 1,
        },
      },
      {
        table: "student",
        values: {
          id: 2,
          name: "Ben",
          email: "ben@college.edu",
          department_id: 1,
        },
      },
      {
        table: "student",
        values: {
          id: 3,
          name: "Cara",
          email: "cara@college.edu",
          department_id: 2,
        },
      },
    ],
    expectedQuery: "SELECT * FROM student;",
    hints: [
      "Use SELECT with * to fetch all columns.",
      "Query from the student table.",
      "Terminate with semicolon.",
    ],
    xp: 100,
  },
  {
    id: "college-query-where",
    title: "College Task: Filtering (WHERE)",
    world: 1,
    type: "query",
    description: "Filter rows with a WHERE condition",
    story: "Show only students from department_id 1.",
    schema: [
      {
        name: "student",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
          { name: "email", type: "VARCHAR" },
          { name: "department_id", type: "INT" },
        ],
      },
    ],
    sampleData: [
      {
        table: "student",
        values: {
          id: 1,
          name: "Anu",
          email: "anu@college.edu",
          department_id: 1,
        },
      },
      {
        table: "student",
        values: {
          id: 2,
          name: "Ben",
          email: "ben@college.edu",
          department_id: 1,
        },
      },
      {
        table: "student",
        values: {
          id: 3,
          name: "Cara",
          email: "cara@college.edu",
          department_id: 2,
        },
      },
      {
        table: "student",
        values: {
          id: 4,
          name: "Deep",
          email: "deep@college.edu",
          department_id: 2,
        },
      },
    ],
    expectedQuery:
      "SELECT id, name FROM student WHERE department_id = 1 ORDER BY id;",
    hints: [
      "Select only id and name columns.",
      "Use WHERE department_id = 1.",
      "Sort using ORDER BY id.",
    ],
    xp: 130,
  },
  {
    id: "college-query-join",
    title: "College Task: Joins",
    world: 1,
    type: "query",
    description: "Join two tables to combine related data",
    story: "List student name with department name.",
    schema: [
      {
        name: "department",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
        ],
      },
      {
        name: "student",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
          {
            name: "department_id",
            type: "INT",
            isForeign: true,
            references: { table: "department", column: "id" },
          },
        ],
      },
    ],
    sampleData: [
      { table: "department", values: { id: 1, name: "Computer Science" } },
      { table: "department", values: { id: 2, name: "Electronics" } },
      { table: "student", values: { id: 1, name: "Anu", department_id: 1 } },
      { table: "student", values: { id: 2, name: "Ben", department_id: 1 } },
      { table: "student", values: { id: 3, name: "Cara", department_id: 2 } },
    ],
    expectedQuery:
      "SELECT s.name, d.name AS department_name FROM student s JOIN department d ON s.department_id = d.id ORDER BY s.id;",
    hints: [
      "Use aliases s and d.",
      "Join on s.department_id = d.id.",
      "Return s.name and department_name.",
    ],
    xp: 170,
  },
  {
    id: "college-query",
    title: "College Task: Advanced Aggregation",
    world: 1,
    type: "query",
    description: "After schema+data setup, write an analytical query",
    story:
      "Find department names and number of students in each department. Order by student_count descending.",
    schema: [
      {
        name: "department",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
          { name: "building", type: "VARCHAR" },
        ],
      },
      {
        name: "student",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
          { name: "email", type: "VARCHAR" },
          {
            name: "department_id",
            type: "INT",
            isForeign: true,
            references: { table: "department", column: "id" },
          },
        ],
      },
      {
        name: "instructor",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
          {
            name: "department_id",
            type: "INT",
            isForeign: true,
            references: { table: "department", column: "id" },
          },
        ],
      },
      {
        name: "course",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
          { name: "credits", type: "INT" },
          {
            name: "department_id",
            type: "INT",
            isForeign: true,
            references: { table: "department", column: "id" },
          },
        ],
      },
    ],
    sampleData: [
      {
        table: "department",
        values: { id: 1, name: "Computer Science", building: "A" },
      },
      {
        table: "department",
        values: { id: 2, name: "Electronics", building: "B" },
      },
      {
        table: "department",
        values: { id: 3, name: "Mechanical", building: "C" },
      },
      {
        table: "student",
        values: {
          id: 1,
          name: "Anu",
          email: "anu@college.edu",
          department_id: 1,
        },
      },
      {
        table: "student",
        values: {
          id: 2,
          name: "Ben",
          email: "ben@college.edu",
          department_id: 1,
        },
      },
      {
        table: "student",
        values: {
          id: 3,
          name: "Cara",
          email: "cara@college.edu",
          department_id: 2,
        },
      },
      {
        table: "student",
        values: {
          id: 4,
          name: "Deep",
          email: "deep@college.edu",
          department_id: 2,
        },
      },
      {
        table: "student",
        values: {
          id: 5,
          name: "Ena",
          email: "ena@college.edu",
          department_id: 3,
        },
      },
      {
        table: "instructor",
        values: { id: 1, name: "Prof Rao", department_id: 1 },
      },
      {
        table: "instructor",
        values: { id: 2, name: "Prof Das", department_id: 2 },
      },
      {
        table: "instructor",
        values: { id: 3, name: "Prof Ali", department_id: 3 },
      },
      {
        table: "course",
        values: { id: 1, name: "DBMS", credits: 4, department_id: 1 },
      },
      {
        table: "course",
        values: { id: 2, name: "Circuits", credits: 3, department_id: 2 },
      },
      {
        table: "course",
        values: { id: 3, name: "Thermo", credits: 3, department_id: 3 },
      },
      {
        table: "course",
        values: { id: 4, name: "OS", credits: 4, department_id: 1 },
      },
    ],
    expectedQuery:
      "SELECT d.name, COUNT(s.id) AS student_count FROM department d LEFT JOIN student s ON s.department_id = d.id GROUP BY d.id, d.name ORDER BY student_count DESC;",
    hints: [
      "Join department with student using department_id.",
      "Use COUNT(student.id) and GROUP BY department fields.",
      "Sort the result by student_count DESC.",
    ],
    xp: 250,
  },
  {
    id: "ecommerce-schema",
    title: "Ecommerce Task: Build Core Schema",
    world: 2,
    type: "schema",
    description: "Create an ecommerce schema and insert sufficient data",
    story:
      "Build tables for users, categories, products, and orders. Then add sample records to each table.",
    expectedSchema: [
      {
        name: "shop_user",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR", isNullable: false },
          { name: "email", type: "VARCHAR", isNullable: false },
        ],
      },
      {
        name: "category",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR", isNullable: false },
        ],
      },
      {
        name: "product",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR", isNullable: false },
          { name: "price", type: "FLOAT", isNullable: false },
          {
            name: "category_id",
            type: "INT",
            isForeign: true,
            references: { table: "category", column: "id" },
            isNullable: false,
          },
        ],
      },
      {
        name: "purchase_order",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          {
            name: "user_id",
            type: "INT",
            isForeign: true,
            references: { table: "shop_user", column: "id" },
            isNullable: false,
          },
          {
            name: "product_id",
            type: "INT",
            isForeign: true,
            references: { table: "product", column: "id" },
            isNullable: false,
          },
          { name: "quantity", type: "INT", isNullable: false },
        ],
      },
    ],
    requiredInserts: {
      shop_user: 4,
      category: 3,
      product: 5,
      purchase_order: 6,
    },
    hints: [
      "Create parent tables shop_user and category before product and purchase_order.",
      "purchase_order should link both the buyer and the purchased product.",
      "Use several INSERT statements per table to satisfy row requirements.",
    ],
    xp: 400,
  },
  {
    id: "ecommerce-query-select",
    title: "Ecommerce Task: SQL Basics (SELECT *)",
    world: 2,
    type: "query",
    description: "Start with selecting all rows",
    story: "Return all products.",
    schema: [
      {
        name: "product",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
          { name: "price", type: "FLOAT" },
          { name: "category_id", type: "INT" },
        ],
      },
    ],
    sampleData: [
      {
        table: "product",
        values: { id: 1, name: "Novel", price: 20, category_id: 1 },
      },
      {
        table: "product",
        values: { id: 2, name: "Headphones", price: 80, category_id: 2 },
      },
      {
        table: "product",
        values: { id: 3, name: "Lamp", price: 35, category_id: 3 },
      },
    ],
    expectedQuery: "SELECT * FROM product;",
    hints: [
      "Use SELECT *.",
      "Read from product table.",
      "Keep semicolon at end.",
    ],
    xp: 110,
  },
  {
    id: "ecommerce-query-where",
    title: "Ecommerce Task: Filtering (WHERE)",
    world: 2,
    type: "query",
    description: "Filter high-price products",
    story: "Show products where price is greater than 40.",
    schema: [
      {
        name: "product",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
          { name: "price", type: "FLOAT" },
          { name: "category_id", type: "INT" },
        ],
      },
    ],
    sampleData: [
      {
        table: "product",
        values: { id: 1, name: "Novel", price: 20, category_id: 1 },
      },
      {
        table: "product",
        values: { id: 2, name: "Headphones", price: 80, category_id: 2 },
      },
      {
        table: "product",
        values: { id: 3, name: "Lamp", price: 35, category_id: 3 },
      },
      {
        table: "product",
        values: { id: 4, name: "Keyboard", price: 50, category_id: 2 },
      },
    ],
    expectedQuery:
      "SELECT id, name, price FROM product WHERE price > 40 ORDER BY price DESC;",
    hints: [
      "Use WHERE price > 40.",
      "Select id, name, price.",
      "Sort by price DESC.",
    ],
    xp: 140,
  },
  {
    id: "ecommerce-query-join",
    title: "Ecommerce Task: Joins",
    world: 2,
    type: "query",
    description: "Join products with categories",
    story: "List product name with its category name.",
    schema: [
      {
        name: "category",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
        ],
      },
      {
        name: "product",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
          { name: "price", type: "FLOAT" },
          {
            name: "category_id",
            type: "INT",
            isForeign: true,
            references: { table: "category", column: "id" },
          },
        ],
      },
    ],
    sampleData: [
      { table: "category", values: { id: 1, name: "Books" } },
      { table: "category", values: { id: 2, name: "Electronics" } },
      {
        table: "product",
        values: { id: 1, name: "Novel", price: 20, category_id: 1 },
      },
      {
        table: "product",
        values: { id: 2, name: "Headphones", price: 80, category_id: 2 },
      },
      {
        table: "product",
        values: { id: 3, name: "Keyboard", price: 50, category_id: 2 },
      },
    ],
    expectedQuery:
      "SELECT p.name, c.name AS category_name FROM product p JOIN category c ON p.category_id = c.id ORDER BY p.id;",
    hints: [
      "Join product and category.",
      "Use p.category_id = c.id.",
      "Return p.name and category_name.",
    ],
    xp: 190,
  },
  {
    id: "ecommerce-query",
    title: "Ecommerce Task: Advanced Revenue by Category",
    world: 2,
    type: "query",
    description: "Write a revenue analysis query",
    story:
      "Find each category and its total revenue using product price * order quantity, sorted from highest revenue.",
    schema: [
      {
        name: "shop_user",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
          { name: "email", type: "VARCHAR" },
        ],
      },
      {
        name: "category",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
        ],
      },
      {
        name: "product",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
          { name: "price", type: "FLOAT" },
          {
            name: "category_id",
            type: "INT",
            isForeign: true,
            references: { table: "category", column: "id" },
          },
        ],
      },
      {
        name: "purchase_order",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          {
            name: "user_id",
            type: "INT",
            isForeign: true,
            references: { table: "shop_user", column: "id" },
          },
          {
            name: "product_id",
            type: "INT",
            isForeign: true,
            references: { table: "product", column: "id" },
          },
          { name: "quantity", type: "INT" },
        ],
      },
    ],
    sampleData: [
      {
        table: "shop_user",
        values: { id: 1, name: "Maya", email: "maya@shop.com" },
      },
      {
        table: "shop_user",
        values: { id: 2, name: "Ravi", email: "ravi@shop.com" },
      },
      {
        table: "shop_user",
        values: { id: 3, name: "Noah", email: "noah@shop.com" },
      },
      {
        table: "shop_user",
        values: { id: 4, name: "Tia", email: "tia@shop.com" },
      },
      { table: "category", values: { id: 1, name: "Books" } },
      { table: "category", values: { id: 2, name: "Electronics" } },
      { table: "category", values: { id: 3, name: "Home" } },
      {
        table: "product",
        values: { id: 1, name: "Novel", price: 20, category_id: 1 },
      },
      {
        table: "product",
        values: { id: 2, name: "Headphones", price: 80, category_id: 2 },
      },
      {
        table: "product",
        values: { id: 3, name: "Lamp", price: 35, category_id: 3 },
      },
      {
        table: "product",
        values: { id: 4, name: "Keyboard", price: 50, category_id: 2 },
      },
      {
        table: "product",
        values: { id: 5, name: "Cookbook", price: 25, category_id: 1 },
      },
      {
        table: "purchase_order",
        values: { id: 1, user_id: 1, product_id: 2, quantity: 1 },
      },
      {
        table: "purchase_order",
        values: { id: 2, user_id: 2, product_id: 1, quantity: 2 },
      },
      {
        table: "purchase_order",
        values: { id: 3, user_id: 3, product_id: 4, quantity: 1 },
      },
      {
        table: "purchase_order",
        values: { id: 4, user_id: 4, product_id: 3, quantity: 3 },
      },
      {
        table: "purchase_order",
        values: { id: 5, user_id: 1, product_id: 5, quantity: 4 },
      },
      {
        table: "purchase_order",
        values: { id: 6, user_id: 2, product_id: 2, quantity: 1 },
      },
    ],
    expectedQuery:
      "SELECT c.name, SUM(p.price * o.quantity) AS revenue FROM category c JOIN product p ON p.category_id = c.id JOIN purchase_order o ON o.product_id = p.id GROUP BY c.id, c.name ORDER BY revenue DESC;",
    hints: [
      "Join category -> product -> purchase_order.",
      "Use SUM(price * quantity) as revenue.",
      "Group by category and order descending by revenue.",
    ],
    xp: 300,
  },
  {
    id: "restaurant-schema",
    title: "Restaurant Task: Build Core Schema",
    world: 3,
    type: "schema",
    description: "Create restaurant operations schema and add inserts",
    story:
      "Design tables for customer, menu_item, restaurant_table, and reservation, then populate each table with data.",
    expectedSchema: [
      {
        name: "customer",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR", isNullable: false },
          { name: "phone", type: "VARCHAR", isNullable: false },
        ],
      },
      {
        name: "menu_item",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR", isNullable: false },
          { name: "price", type: "FLOAT", isNullable: false },
          { name: "category", type: "VARCHAR", isNullable: false },
        ],
      },
      {
        name: "restaurant_table",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "table_number", type: "INT", isNullable: false },
          { name: "capacity", type: "INT", isNullable: false },
        ],
      },
      {
        name: "reservation",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          {
            name: "customer_id",
            type: "INT",
            isForeign: true,
            references: { table: "customer", column: "id" },
            isNullable: false,
          },
          {
            name: "table_id",
            type: "INT",
            isForeign: true,
            references: { table: "restaurant_table", column: "id" },
            isNullable: false,
          },
          { name: "reservation_date", type: "DATE", isNullable: false },
        ],
      },
    ],
    requiredInserts: {
      customer: 4,
      menu_item: 6,
      restaurant_table: 4,
      reservation: 5,
    },
    hints: [
      "Create customer and restaurant_table before reservation.",
      "Reservation must reference both customer and restaurant_table.",
      "Insert multiple rows in every table, not just one.",
    ],
    xp: 450,
  },
  {
    id: "restaurant-query-select",
    title: "Restaurant Task: SQL Basics (SELECT *)",
    world: 3,
    type: "query",
    description: "Start with selecting all rows",
    story: "Return all rows from menu_item.",
    schema: [
      {
        name: "menu_item",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
          { name: "price", type: "FLOAT" },
          { name: "category", type: "VARCHAR" },
        ],
      },
    ],
    sampleData: [
      {
        table: "menu_item",
        values: { id: 1, name: "Pasta", price: 12.5, category: "Main" },
      },
      {
        table: "menu_item",
        values: { id: 2, name: "Soup", price: 7.5, category: "Starter" },
      },
      {
        table: "menu_item",
        values: { id: 3, name: "Steak", price: 24, category: "Main" },
      },
    ],
    expectedQuery: "SELECT * FROM menu_item;",
    hints: ["Use SELECT *.", "Table name is menu_item.", "End with semicolon."],
    xp: 120,
  },
  {
    id: "restaurant-query-where",
    title: "Restaurant Task: Filtering (WHERE)",
    world: 3,
    type: "query",
    description: "Filter records by a condition",
    story: "List reservations for table_id 2.",
    schema: [
      {
        name: "reservation",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "customer_id", type: "INT" },
          { name: "table_id", type: "INT" },
          { name: "reservation_date", type: "DATE" },
        ],
      },
    ],
    sampleData: [
      {
        table: "reservation",
        values: {
          id: 1,
          customer_id: 1,
          table_id: 2,
          reservation_date: "2026-03-11",
        },
      },
      {
        table: "reservation",
        values: {
          id: 2,
          customer_id: 2,
          table_id: 2,
          reservation_date: "2026-03-12",
        },
      },
      {
        table: "reservation",
        values: {
          id: 3,
          customer_id: 3,
          table_id: 1,
          reservation_date: "2026-03-12",
        },
      },
      {
        table: "reservation",
        values: {
          id: 4,
          customer_id: 4,
          table_id: 4,
          reservation_date: "2026-03-13",
        },
      },
    ],
    expectedQuery:
      "SELECT id, reservation_date FROM reservation WHERE table_id = 2 ORDER BY id;",
    hints: [
      "Filter with WHERE table_id = 2.",
      "Select id and reservation_date.",
      "Sort by id.",
    ],
    xp: 150,
  },
  {
    id: "restaurant-query-join",
    title: "Restaurant Task: Joins",
    world: 3,
    type: "query",
    description: "Join reservations with table info",
    story: "Show reservation id with table number.",
    schema: [
      {
        name: "restaurant_table",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "table_number", type: "INT" },
          { name: "capacity", type: "INT" },
        ],
      },
      {
        name: "reservation",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "customer_id", type: "INT" },
          {
            name: "table_id",
            type: "INT",
            isForeign: true,
            references: { table: "restaurant_table", column: "id" },
          },
          { name: "reservation_date", type: "DATE" },
        ],
      },
    ],
    sampleData: [
      {
        table: "restaurant_table",
        values: { id: 1, table_number: 1, capacity: 2 },
      },
      {
        table: "restaurant_table",
        values: { id: 2, table_number: 2, capacity: 4 },
      },
      {
        table: "restaurant_table",
        values: { id: 4, table_number: 4, capacity: 6 },
      },
      {
        table: "reservation",
        values: {
          id: 1,
          customer_id: 1,
          table_id: 2,
          reservation_date: "2026-03-11",
        },
      },
      {
        table: "reservation",
        values: {
          id: 2,
          customer_id: 2,
          table_id: 2,
          reservation_date: "2026-03-12",
        },
      },
      {
        table: "reservation",
        values: {
          id: 3,
          customer_id: 4,
          table_id: 4,
          reservation_date: "2026-03-13",
        },
      },
    ],
    expectedQuery:
      "SELECT r.id, t.table_number FROM reservation r JOIN restaurant_table t ON r.table_id = t.id ORDER BY r.id;",
    hints: [
      "Use aliases r and t.",
      "Join on r.table_id = t.id.",
      "Return reservation id and table_number.",
    ],
    xp: 210,
  },
  {
    id: "restaurant-query",
    title: "Restaurant Task: Advanced Busy Tables",
    world: 3,
    type: "query",
    description: "Find table usage frequency",
    story:
      "List table numbers and how many reservations each table has, highest first.",
    schema: [
      {
        name: "customer",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
          { name: "phone", type: "VARCHAR" },
        ],
      },
      {
        name: "menu_item",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "name", type: "VARCHAR" },
          { name: "price", type: "FLOAT" },
          { name: "category", type: "VARCHAR" },
        ],
      },
      {
        name: "restaurant_table",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          { name: "table_number", type: "INT" },
          { name: "capacity", type: "INT" },
        ],
      },
      {
        name: "reservation",
        columns: [
          { name: "id", type: "INT", isPrimary: true },
          {
            name: "customer_id",
            type: "INT",
            isForeign: true,
            references: { table: "customer", column: "id" },
          },
          {
            name: "table_id",
            type: "INT",
            isForeign: true,
            references: { table: "restaurant_table", column: "id" },
          },
          { name: "reservation_date", type: "DATE" },
        ],
      },
    ],
    sampleData: [
      {
        table: "customer",
        values: { id: 1, name: "Isha", phone: "1111111111" },
      },
      {
        table: "customer",
        values: { id: 2, name: "Leo", phone: "2222222222" },
      },
      {
        table: "customer",
        values: { id: 3, name: "Mira", phone: "3333333333" },
      },
      {
        table: "customer",
        values: { id: 4, name: "Omar", phone: "4444444444" },
      },
      {
        table: "menu_item",
        values: { id: 1, name: "Pasta", price: 12.5, category: "Main" },
      },
      {
        table: "menu_item",
        values: { id: 2, name: "Soup", price: 7.5, category: "Starter" },
      },
      {
        table: "menu_item",
        values: { id: 3, name: "Steak", price: 24, category: "Main" },
      },
      {
        table: "menu_item",
        values: { id: 4, name: "Cake", price: 8, category: "Dessert" },
      },
      {
        table: "menu_item",
        values: { id: 5, name: "Juice", price: 5, category: "Drink" },
      },
      {
        table: "menu_item",
        values: { id: 6, name: "Coffee", price: 4, category: "Drink" },
      },
      {
        table: "restaurant_table",
        values: { id: 1, table_number: 1, capacity: 2 },
      },
      {
        table: "restaurant_table",
        values: { id: 2, table_number: 2, capacity: 4 },
      },
      {
        table: "restaurant_table",
        values: { id: 3, table_number: 3, capacity: 4 },
      },
      {
        table: "restaurant_table",
        values: { id: 4, table_number: 4, capacity: 6 },
      },
      {
        table: "reservation",
        values: {
          id: 1,
          customer_id: 1,
          table_id: 2,
          reservation_date: "2026-03-11",
        },
      },
      {
        table: "reservation",
        values: {
          id: 2,
          customer_id: 2,
          table_id: 2,
          reservation_date: "2026-03-12",
        },
      },
      {
        table: "reservation",
        values: {
          id: 3,
          customer_id: 3,
          table_id: 1,
          reservation_date: "2026-03-12",
        },
      },
      {
        table: "reservation",
        values: {
          id: 4,
          customer_id: 4,
          table_id: 4,
          reservation_date: "2026-03-13",
        },
      },
      {
        table: "reservation",
        values: {
          id: 5,
          customer_id: 1,
          table_id: 2,
          reservation_date: "2026-03-14",
        },
      },
    ],
    expectedQuery:
      "SELECT t.table_number, COUNT(r.id) AS reservation_count FROM restaurant_table t LEFT JOIN reservation r ON r.table_id = t.id GROUP BY t.id, t.table_number ORDER BY reservation_count DESC;",
    hints: [
      "Join restaurant_table with reservation by table id.",
      "Use COUNT(reservation.id) and group by table number.",
      "Sort with ORDER BY reservation_count DESC.",
    ],
    xp: 300,
  },
];
