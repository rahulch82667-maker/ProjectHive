import { NextRequest, NextResponse } from 'next/server';
import { 
  signup, 
  login, 
  googleAuth, 
  getMe, 
  refreshAccessToken, 
  logout, 
  forgotPassword 
} from '../../../../backend/controllers/auth.controller';

export async function POST(req: NextRequest, props: { params: Promise<{ action: string }> }) {
  const params = await props.params;
  const action = params.action;

  try {
    switch (action) {
      case 'signup': return await signup(req);
      case 'login': return await login(req);
      case 'google': return await googleAuth(req);
      case 'refresh': return await refreshAccessToken(req);
      case 'logout': return await logout(req);
      case 'forgot-password': return await forgotPassword(req);
      default: return NextResponse.json({ message: 'Route not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`Error in /api/auth/${action}:`, error);
    return NextResponse.json({ message: error.message || 'Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, props: { params: Promise<{ action: string }> }) {
  const params = await props.params;
  const action = params.action;

  try {
    switch (action) {
      case 'me': return await getMe(req);
      default: return NextResponse.json({ message: 'Route not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`Error in /api/auth/${action}:`, error);
    return NextResponse.json({ message: error.message || 'Server Error' }, { status: 500 });
  }
}
