import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chart from '@/models/Chart';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const icao = searchParams.get('icao');

    if (icao) {
      if (icao.length !== 4) {
        return NextResponse.json({ error: 'ICAO must be exactly 4 letters' }, { status: 400 });
      }
      const charts = await Chart.find({ icao: icao.toUpperCase() }).sort({ createdAt: -1 });
      return NextResponse.json({ charts });
    }

    const charts = await Chart.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ charts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { icao, fileUrl, originalName } = body;

    if (!icao || !fileUrl) {
      return NextResponse.json({ error: 'ICAO and fileUrl are required' }, { status: 400 });
    }

    if (icao.length !== 4) {
      return NextResponse.json({ error: 'ICAO must be exactly 4 letters' }, { status: 400 });
    }

    const chart = await Chart.create({
      icao: icao.toUpperCase(),
      fileUrl,
      originalName,
    });

    return NextResponse.json({ chart }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
