const ExcelJS = require('exceljs');
const Database = require('better-sqlite3');
const fs = require('fs');

// Read Excel file
async function readExcelFile() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('Team Roster.xlsx');
    const worksheet = workbook.getWorksheet(1); // Get first worksheet
    
    const data = [];
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        
        // Convert row to object with proper column names
        const rowData = {
            team_name: row.getCell(1).value,
            team_members: row.getCell(2).value,
        };
        
        // Add round columns (assuming they start from column 3)
        for (let i = 3; i <= row.cellCount; i++) {
            rowData[`round_${i-2}`] = row.getCell(i).value;
        }
        
        data.push(rowData);
    });
    
    return data;
}

// Initialize database and create table
function setupDatabase(data) {
    const db = new Database('roster.db');
    
    try {
        // Drop existing table if it exists
        db.prepare('DROP TABLE IF EXISTS roster').run();
        
        // Create table with known structure
        db.prepare(`
            CREATE TABLE roster (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                team_name TEXT,
                team_members TEXT,
                round_1 TEXT,
                round_2 TEXT,
                round_3 TEXT,
                round_4 TEXT,
                round_5 TEXT,
                round_6 TEXT,
                round_7 TEXT,
                round_8 TEXT,
                round_9 TEXT,
                round_10 TEXT
            )
        `).run();
        
        console.log('Table created successfully');
        
        // Insert data
        const insert = db.prepare(`
            INSERT INTO roster (
                team_name, team_members, 
                round_1, round_2, round_3, round_4, round_5,
                round_6, round_7, round_8, round_9, round_10
            ) VALUES (
                ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?
            )
        `);
        
        const insertMany = db.transaction((records) => {
            for (const record of records) {
                insert.run(
                    record.team_name,
                    record.team_members,
                    record.round_1,
                    record.round_2,
                    record.round_3,
                    record.round_4,
                    record.round_5,
                    record.round_6,
                    record.round_7,
                    record.round_8,
                    record.round_9,
                    record.round_10
                );
            }
        });
        
        insertMany(data);
        console.log(`Inserted ${data.length} records`);
        
    } catch (error) {
        console.error('Error setting up database:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Main execution
async function main() {
    try {
        console.log('Starting database setup...');
        const data = await readExcelFile();
        setupDatabase(data);
        console.log('Database setup completed successfully');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
