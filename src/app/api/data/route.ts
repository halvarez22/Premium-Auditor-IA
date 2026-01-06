import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');

    try {
        // En desarrollo, leer del archivo JSON extraído
        const dataPath = path.join(process.cwd(), 'data_elizondo_extracted.json');

        if (!fs.existsSync(dataPath)) {
            return NextResponse.json({
                error: 'No data available',
                message: 'Please run the extraction script first'
            }, { status: 404 });
        }

        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(rawData);

        return NextResponse.json({
            success: true,
            data: data,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to load data',
            message: error.message
        }, { status: 500 });
    }
}
