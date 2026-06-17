import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Report } from '@/models/Report';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId'); // Get from query for now, later from session

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const reports = await Report.find({ userId }).sort({ createdAt: -1 }).limit(20);

    return NextResponse.json({ history: reports }, { status: 200 });
  } catch (error: any) {
    console.error('History API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
