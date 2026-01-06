import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');

    try {
        // Definir la ruta del reporte de anomalías dinámicamente
        const isMajoba = company?.includes('Majoba');
        const filename = isMajoba ? 'anomaly_report_majoba.json' : 'anomaly_report_elizondo.json';
        const reportPath = path.join(process.cwd(), filename);

        if (!fs.existsSync(reportPath)) {
            return NextResponse.json({
                found: false,
                message: 'No anomaly report found'
            }, { status: 404 });
        }

        const rawData = fs.readFileSync(reportPath, 'utf-8');
        const data = JSON.parse(rawData);

        return NextResponse.json({
            success: true,
            data: data,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to load anomaly data',
            message: error.message
        }, { status: 500 });
    }
}
