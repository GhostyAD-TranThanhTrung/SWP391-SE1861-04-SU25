import sql from 'mssql'

const config = {
    user: 'sa',
    password: '12345',
    server: 'localhost',
    port: 1433,
    database: 'skibidi',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    }
}

async function getConnection() {
    try {
        let temp = await sql.connect(config)
        return temp
    } catch (err) {
        return null
    }
}
export default getConnection