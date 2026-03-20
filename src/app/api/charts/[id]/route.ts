import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Chart from '@/models/Chart';

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, props: RouteProps) {
  try {
    await dbConnect();
    const params = await props.params;
    const body = await request.json();
    const { fileUrl, icao, originalName } = body;
    
    // Update chart
    const updateData: any = {};
    if (fileUrl) updateData.fileUrl = fileUrl;
    if (icao) updateData.icao = icao.toUpperCase();
    if (originalName) updateData.originalName = originalName;

    const chart = await Chart.findByIdAndUpdate(params.id, updateData, { new: true, runValidators: true });
    
    if (!chart) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 });
    }

    return NextResponse.json({ chart });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: RouteProps) {
  try {
    await dbConnect();
    const params = await props.params;
    const chart = await Chart.findByIdAndDelete(params.id);
    
    if (!chart) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Chart deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
