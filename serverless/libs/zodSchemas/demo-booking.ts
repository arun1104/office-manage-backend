import { z } from "zod";

// Base schema for all bookings
const baseBookingSchema = {
  domain:z.string().min(2,'To short, Please provide a valid domain name').max(40,'Too long, Please provide a valid domain name'),
  firstname: z.string().min(2, "First name must be at least 2 characters"),
  lastname: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
  proposedDate: z.string().min(1, "Please select your preferred date"),
  proposedTime: z.string().min(1, "Please select your preferred time"),
  timezone: z.string().min(1, "Please select your timezone"),
  useCase: z.string().optional(),
  technicalRequirements: z.string().optional(),
};

// Additional fields for business bookings
const businessFields = {
  bookingType: z.literal('business'),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  teamSize: z.string().min(1, "Please select your team size"),
  industry: z.string().min(2, "Please specify your industry"),
};

// Additional fields for individual bookings
const individualFields = {
  bookingType: z.literal('individual'),
  occupation: z.string().optional(),
  interests: z.string().optional(),
};

// Combined schema using discriminated union
export const bookingSchema = z.discriminatedUnion('bookingType', [
  z.object({
    ...baseBookingSchema,
    ...businessFields,
  }),
  z.object({
    ...baseBookingSchema,
    ...individualFields,
  }),
]);

export type BookingSchema = z.infer<typeof bookingSchema>;

export class BookingError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "BookingError";
  }
}