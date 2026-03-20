# SQL Escape Dungeon - Complete Implementation Guide

## 🎮 Project Overview

**SQL Escape Dungeon** is a gamified learning platform that teaches SQL and database design together. Users progress through 5 worlds, completing levels that range from basic SELECT queries to complex database schema design tasks.

## ✅ What's Been Built

### Phase 1: SQL Query Engine & Static Levels ✓

- ✅ 8 pre-configured levels across 5 worlds
- ✅ SQL query execution with safety validation
- ✅ Dynamic level loading via API
- ✅ 3-panel game layout (Story/Hints, Editor/Results, Schema)
- ✅ Hint system with progressive difficulty

### Phase 2: Database Schema Builder ✓

- ✅ Interactive schema builder component
- ✅ Table and column management UI
- ✅ Primary/Foreign key support
- ✅ ER diagram generation from schema
- ✅ Visual ER comparison (user vs expected)

### Phase 3: Schema Validation & Progress Tracking ✓

- ✅ Schema comparison engine
- ✅ Detailed feedback on schema accuracy
- ✅ Scoring system (0-100)
- ✅ Progress persistence using localStorage
- ✅ XP tracking and achievement counting

---

## 📁 Project Structure

```
sql/
├── app/
│   ├── api/                          # API Routes
│   │   ├── levels/route.ts          # Get all levels or specific level
│   │   ├── query/route.ts           # Execute SQL queries
│   │   ├── schema/route.ts          # Compare schemas
│   │   └── progress/route.ts        # Save/load progress
│   ├── level/[id]/page.tsx          # SQL query game screen
│   ├── schema/[id]/page.tsx         # Schema builder game screen
│   ├── page.tsx                     # World map (home page)
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # Tailwind styles
├── components/
│   ├── Button.tsx                   # Reusable button component
│   ├── HintSystem.tsx               # Progressive hint system
│   ├── LevelCard.tsx                # Level card UI
│   ├── ERDiagram.tsx                # ER diagram visualization
│   ├── ResultTable.tsx              # Query results display
│   ├── SchemaBuilder.tsx            # Interactive schema builder
│   ├── SqlEditor.tsx                # SQL syntax editor
│   ├── TablePreview.tsx             # Schema table display
│   └── WorldMap.tsx                 # Level progression map
├── lib/
│   ├── comparison.ts                # Schema validation & comparison
│   ├── db.ts                        # Database utilities
│   ├── erd.ts                       # ER diagram generation
│   ├── hooks.ts                     # useProgress custom hook
│   └── levels.ts                    # Level definitions
├── types/
│   ├── index.ts                     # Core TypeScript interfaces
│   └── sql.d.ts                     # SQL.js type declarations
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 🎯 Levels Included

### World 1: SELECT & WHERE (2 Levels)

- **w1-l1**: Your First Query - Learn SELECT \*
- **w1-l2**: Filter with WHERE - Learn WHERE clause

### World 2: JOIN (1 Level)

- **w2-l1**: Introduction to JOIN - Combine tables

### World 3: GROUP BY (1 Level)

- **w3-l1**: Count Records - Learn GROUP BY and COUNT

### World 4: Subqueries (1 Level)

- **w4-l1**: Nested Queries - Learn subqueries

### World 5: Database Design (2 Levels)

- **w5-l1**: Design a College Database - Create 5-table schema
- **w5-l2**: Add Sections - Extend schema with sections table

---

## 🔧 Key Features Implemented

### 1. **SQL Query Execution**

- Safe query validation (SELECT only)
- Blocks dangerous keywords (DROP, DELETE, UPDATE, INSERT)
- Timeout protection (5 seconds)
- Error reporting with execution time

**Location**: [lib/db.ts](lib/db.ts), [app/api/query/route.ts](app/api/query/route.ts)

### 2. **Schema Builder**

- Drag-and-drop style table creation
- Column management (add/edit/delete)
- Primary key designation
- Foreign key relationships with table references
- Real-time validation feedback

**Location**: [components/SchemaBuilder.tsx](components/SchemaBuilder.tsx)

### 3. **ER Diagram Generation**

- Automatic relationship detection
- Cardinality calculation (1:N, M:N)
- Visual representation of schema
- Side-by-side comparison (user vs expected)

**Location**: [lib/erd.ts](lib/erd.ts), [components/ERDiagram.tsx](components/ERDiagram.tsx)

### 4. **Schema Comparison Engine**

- Table-level validation
- Column correctness checking
- Primary/Foreign key validation
- Relationship verification
- Score calculation (0-100)

**Location**: [lib/comparison.ts](lib/comparison.ts)

### 5. **Progress Tracking**

- localStorage-based persistence
- XP accumulation
- Level completion tracking
- Attempt counting
- Hint usage tracking

**Location**: [lib/hooks.ts](lib/hooks.ts), [app/api/progress/route.ts](app/api/progress/route.ts)

### 6. **Hint System**

- Progressive hints (basic → detailed → full solution)
- Sequential unlock (must unlock hint 1 before 2)
- Hint usage tracking
- Integrated into both query and schema levels

**Location**: [components/HintSystem.tsx](components/HintSystem.tsx)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd e:\Softwares\sql
npm install
npm run dev
```

The app will start on `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

---

## 📊 Data Models

### Level

```typescript
{
  id: string;
  title: string;
  world: number;
  type: "query" | "schema";
  description: string;
  story: string;
  schema?: TableSchema[];
  expectedQuery?: string;
  expectedSchema?: TableSchema[];
  expectedERD?: ERD;
  hints: string[];
  xp: number;
}
```

### TableSchema

```typescript
{
  name: string;
  columns: Column[];
}
```

### Column

```typescript
{
  name: string;
  type: "INT" | "VARCHAR" | "TEXT" | "DATE" | "FLOAT" | "BOOLEAN";
  isPrimary?: boolean;
  isForeign?: boolean;
  references?: { table: string; column: string };
  isNullable?: boolean;
}
```

### ComparisonResult

```typescript
{
  isCorrect: boolean;
  correctTables: string[];
  missingTables: string[];
  extraTables: string[];
  incorrectColumns: { table: string; issues: string[] }[];
  missingForeignKeys: { from: string; to: string }[];
  extraForeignKeys: { from: string; to: string }[];
  issues: string[];
  score: number; // 0-100
}
```

---

## 🔌 API Routes

### GET /api/levels

Get all levels grouped by world

```json
{
  "1": [Level, Level],
  "2": [Level],
  ...
}
```

### GET /api/levels?id=:id

Get a specific level by ID

### POST /api/query

Execute a SQL query

```json
{
  "query": "SELECT * FROM student;",
  "schema": [TableSchema]
}
```

Response:

```json
{
  "success": boolean,
  "data": any[],
  "columns": string[],
  "error"?: string,
  "executionTime": number
}
```

### POST /api/schema

Compare user schema with expected schema

```json
{
  "userSchema": [TableSchema],
  "expectedSchema": [TableSchema]
}
```

Response:

```json
{
  "isValid": boolean,
  "schemaComparison": ComparisonResult,
  "erdComparison": ERDComparisonResult,
  "userERD": ERD,
  "expectedERD": ERD
}
```

### POST /api/progress

Save user progress

```json
{
  "userId": string,
  "levelId": string,
  "completed": boolean,
  "xpEarned": number,
  "schema"?: TableSchema[],
  "query"?: string,
  "hintsUsed": number
}
```

### GET /api/progress?userId=:userId&levelId=:levelId

Get user progress for a specific level

---

## 🎨 UI Components

### SchemaBuilder

Interactive component for creating database schemas. Features:

- Add/delete tables
- Add/delete/edit columns
- Set primary keys
- Create foreign key relationships
- Type selection (INT, VARCHAR, TEXT, DATE, FLOAT, BOOLEAN)

### SqlEditor

Code editor for SQL queries with:

- Syntax highlighting (basic)
- Execute button
- Query validation
- Placeholder example

### ResultTable

Displays query execution results:

- Column headers
- Data rows (limited to 100 for performance)
- Row count
- Execution time
- Error messages

### ERDiagram

Visual ER diagram component showing:

- Tables as nodes
- Relationships as edges
- Cardinality labels (1:N, M:N)
- Side-by-side user vs expected comparison

### HintSystem

Progressive hint system:

- Expandable hint cards
- Sequential unlocking
- Visual indicators for revealed hints
- Hint tracking

---

## 🔐 Security Features

1. **SQL Injection Protection**: Only SELECT queries allowed
2. **Dangerous Keyword Blocking**: Prevents DROP, DELETE, UPDATE, INSERT
3. **Query Timeout**: 5-second maximum execution time
4. **Input Validation**: Schema validation before comparison
5. **Client-side Validation**: Frontend validation prevents invalid submissions

---

## 📈 Scoring System

Schema design levels use a scoring algorithm:

```
Score = TableScore - MissingFKPenalty - ExtraTablePenalty - ColumnPenalty
TableScore = (CorrectTables / TotalExpectedTables) × 100
MissingFKPenalty = (MissingFKs / TotalExpectedFKs) × 50
ExtraTablePenalty = ExtraTableCount × 20
ColumnPenalty = ColumnIssueCount × 15
```

Level is considered "correct" when score ≥ 90.

---

## 🎮 Game Flow

1. **Home Page**: User sees world map with locked/unlocked levels
2. **Level Selection**: Click a level to start
3. **Query Levels**:
   - View story and hints
   - Write SQL query in editor
   - View results immediately
   - Get feedback on correctness
4. **Schema Levels**:
   - View story and hints
   - Build schema using SchemaBuilder
   - View your ER diagram
   - Click "Check Schema" to validate
   - See detailed comparison with expected schema
5. **Progression**: Complete level → Earn XP → Unlock next level

---

## 🔄 Progress Persistence

User progress is stored in browser localStorage:

```
localStorage['progress_demo-user'] = {
  "w1-l1": { userId, levelId, completed, xpEarned, ... },
  "w1-l2": { ... },
  ...
}
```

Ready for backend integration - API routes can be extended to save to a database.

---

## 🚀 Future Enhancements

### Planned Features

1. **Authentication**: User accounts and profiles
2. **Database Backend**: Replace localStorage with PostgreSQL/MySQL
3. **Real SQL Execution**: Run queries against actual database
4. **Advanced ER Diagrams**: Interactive React Flow visualization
5. **Leaderboard**: Track top players by total XP
6. **AI Hints**: GPT-powered adaptive hints
7. **More Levels**: 50+ levels across additional topics
8. **Mobile Responsive**: Full mobile support
9. **Dark Mode**: Theme switching
10. **Social Features**: Level sharing and multiplayer challenges

### Technical Debt

1. Add proper SQL parser instead of regex-based validation
2. Implement real database schema management
3. Add unit tests for comparison engine
4. Optimize query execution for large datasets
5. Add performance monitoring

---

## 📚 Learning Path

The game teaches SQL progressively:

**Beginner (Worlds 1-2)**

- Basic SELECT queries
- WHERE clause filtering
- Simple JOIN operations

**Intermediate (Worlds 3-4)**

- Aggregation with GROUP BY
- Nested subqueries
- Building on previous concepts

**Advanced (World 5)**

- Database design thinking
- Schema normalization
- Relationship modeling
- Real-world scenarios

---

## 🏆 Success Metrics

Track via the progress system:

- **Level Completion %**: Percentage of levels completed
- **Query Success Rate**: % of query attempts that match expected output
- **Time Per Level**: Average time to complete
- **Schema Accuracy**: Average score on schema design levels
- **Total XP**: Cumulative experience points

---

## 📦 Dependencies

Core dependencies:

- **next**: ^16.2.0 - React framework
- **react**: ^19.2.4 - UI library
- **tailwindcss**: ^4 - Styling
- **reactflow**: ^11.11.0 - ER diagram visualization
- **sql.js**: ^1.10.2 - SQL execution engine
- **react-hook-form**: ^7.51.0 - Form management

---

## 🤝 Contributing

To add new levels:

1. Add Level object to [lib/levels.ts](lib/levels.ts)
2. Follow the Level type structure
3. Include story, hints (3 levels), and xp reward
4. Test via the API

To extend functionality:

1. Create feature branch
2. Update components in [components/](components/)
3. Add/update API routes in [app/api/](app/api/)
4. Update types if needed in [types/index.ts](types/index.ts)

---

## 📄 License

This project is created as a learning platform and portfolio project.

---

## 🎯 Deployment

Project is ready for deployment to:

- **Vercel** (recommended for Next.js)
- **Netlify** (with serverless functions)
- **AWS Amplify**
- **Docker** (for custom deployments)

For production, consider:

1. Setting up a PostgreSQL database
2. Implementing user authentication (Auth0/Clerk)
3. Adding monitoring and analytics
4. Setting up CI/CD pipeline
5. Configuring CDN for assets

---

**Last Updated**: March 20, 2026
**Status**: Phase 1-3 Complete - MVP Ready
