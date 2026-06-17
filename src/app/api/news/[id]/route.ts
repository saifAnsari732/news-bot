import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Report } from '@/models/Report';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unwrappedParams = await params;
    await connectToDatabase();
    
    // In production, check session to ensure user owns this report!
    const report = await Report.findById(unwrappedParams.id);
    
    if (!report) {
      return NextResponse.json({ message: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch Report Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unwrappedParams = await params;
    await connectToDatabase();
    
    const result = await Report.findByIdAndDelete(unwrappedParams.id);
    
    if (!result) {
      return NextResponse.json({ message: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Report deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete Report Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
