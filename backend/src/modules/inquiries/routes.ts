import { Router, Request, Response } from 'express';
import { InquiryService } from './service';
import { createError } from '../../utils/errorHandler';
import prisma from '../../config/database';

const router = Router();



// Create new inquiry
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('Inquiry POST request received:', req.body);
    console.log('Request headers:', req.headers);
    
    const { message, mobileNumber } = req.body;
    console.log('Extracted data:', { message, mobileNumber });

    // Validation
    if (!message || !mobileNumber) {
      console.log('Validation failed: missing message or mobileNumber');
      return res.status(400).json({
        success: false,
        error: 'Message and mobile number are required',
      });
    }

    if (message.trim().length < 10) {
      console.log('Validation failed: message too short');
      return res.status(400).json({
        success: false,
        error: 'Message must be at least 10 characters long',
      });
    }

    // Basic mobile number validation
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileNumber.replace(/\s/g, ''))) {
      console.log('Validation failed: invalid mobile number');
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit mobile number',
      });
    }

    console.log('Validation passed, creating inquiry...');
    
    const inquiry = await InquiryService.createInquiry({
      message: message.trim(),
      mobileNumber: mobileNumber.trim(),
    });

    console.log('Inquiry created successfully:', inquiry);
    res.status(201).json({
      success: true,
      data: inquiry,
      message: 'Inquiry submitted successfully',
    });
  } catch (error) {
    console.error('Error in inquiry creation:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to submit inquiry',
    });
  }
});

// Get all inquiries (admin only)
router.get('/', async (req: Request, res: Response) => {
  try {
    const inquiries = await InquiryService.getAllInquiries();
    
    res.json({
      success: true,
      data: inquiries,
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inquiries',
    });
  }
});

// Get inquiry by ID (admin only)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inquiry = await InquiryService.getInquiryById(id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found',
      });
    }

    res.json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inquiry',
    });
  }
});

// Update inquiry status (admin only)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['PENDING', 'RESPONDED', 'CLOSED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status is required (PENDING, RESPONDED, CLOSED)',
      });
    }

    const inquiry = await InquiryService.updateInquiryStatus(id, status);
    
    res.json({
      success: true,
      data: inquiry,
      message: 'Inquiry status updated successfully',
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update inquiry status',
    });
  }
});

// Delete inquiry (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await InquiryService.deleteInquiry(id);
    
    res.json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete inquiry',
    });
  }
});

export default router;
