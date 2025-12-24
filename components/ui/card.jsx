import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// ✅ שינוי קטן: מאפשר לטקסט ארוך להישבר ולא “לברוח”
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground break-words overflow-hidden",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// ✅ שינוי קטן: שומר על overflow-wrap בתוך התוכן
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0 break-words overflow-hidden", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/**
 * ✅ קומפוננטה ייעודית לכתובות/מחרוזות ארוכות:
 * - שורה 1: קצרה (לא חובה)
 * - שורה 2: מלאה עם break-all כדי שלא תברח מהכרטיס
 */
const CardAddress = React.forwardRef(
  ({ className, short, children, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {short ? (
        <div className="text-xl font-semibold font-mono">{short}</div>
      ) : null}

      <div className="text-xs font-mono text-muted-foreground break-all">
        {children}
      </div>
    </div>
  )
);
CardAddress.displayName = "CardAddress";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAddress, // ✅ חדש
};
