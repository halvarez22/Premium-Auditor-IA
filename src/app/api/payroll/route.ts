import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');

    try {
        // Solo Majoba tiene reporte de nómina por ahora
        const isMajoba = company?.includes('Majoba');

        if (!isMajoba) {
            return NextResponse.json({
                hasPayroll: false,
                message: 'No payroll data for this company'
            });
        }

        const reportPath = path.join(process.cwd(), 'payroll_report_majoba.json');

        if (!fs.existsSync(reportPath)) {
            return NextResponse.json({
                found: false,
                message: 'Payroll report not generated yet'
            }, { status: 404 });
        }

        const rawData = fs.readFileSync(reportPath, 'utf-8');
        const data = JSON.parse(rawData);

        return NextResponse.json({
            success: true,
            hasPayroll: true,
            data: data
        });

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to load payroll data',
            message: error.message
        }, { status: 500 });
    }
}
