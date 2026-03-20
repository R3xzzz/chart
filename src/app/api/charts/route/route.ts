import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chart from '@/models/Chart';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const dep = searchParams.get('dep');
    const arr = searchParams.get('arr');

    if (!dep && !arr) {
      return NextResponse.json({ error: 'Missing dep or arr parameter' }, { status: 400 });
    }

    const departureCharts = dep ? await Chart.find({ icao: dep.toUpperCase() }).sort({ createdAt: -1 }) : [];
    const arrivalCharts = arr ? await Chart.find({ icao: arr.toUpperCase() }).sort({ createdAt: -1 }) : [];

    return NextResponse.json({ departureCharts, arrivalCharts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
