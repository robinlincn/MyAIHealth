
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, Gender, BloodType, MaritalStatus, ReliabilityOption } from "@/lib/types";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { format, parse, isValid, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const educationLevelOptions = [
  { value: 'primary_school', label: '小学' },
  { value: 'junior_high_school', label: '初中' },
  { value: 'senior_high_school', label: '高中/中专' },
  { value: 'college', label: '大专' },
  { value: 'bachelor', label: '本科' },
  { value: 'master', label: '硕士' },
  { value: 'doctorate', label: '博士' },
  { value: 'other', label: '其他' },
];

const profileFormSchema = z.object({
  name: z.string().min(1, "姓名不能为空。").max(50, "姓名不能超过50个字符。"),
  gender: z.enum(["male", "female", "other"], { required_error: "请选择性别。" }) as z.ZodType<Gender | undefined>,
  dob: z.date({ required_error: "请选择出生日期。" }).optional(),
  address: z.string().optional(),
  hadPreviousCheckup: z.boolean().default(false).optional(),
  agreesToIntervention: z.boolean().default(false).optional(),
  contactPhone: z.string().regex(/^1[3-9]\d{9}$/, "请输入有效的中国大陆手机号码。").or(z.literal("")),
  contactEmail: z.string().email("请输入有效的邮箱地址。").or(z.literal("")).optional(),
  bloodType: z.enum(["A", "B", "O", "AB", "unknown"], { required_error: "请选择血型。" }) as z.ZodType<BloodType | undefined>,
  maritalStatus: z.enum(["unmarried", "married", "divorced", "widowed", "other"], { required_error: "请选择婚姻状况。" }) as z.ZodType<MaritalStatus | undefined>,
  occupation: z.string().optional(),
  educationLevel: z.string().optional(),
  // Fields typically managed by institution, shown as read-only to patient
  recordNumber: z.string().optional(),
  admissionDate: z.date().optional(),
  recordDate: z.date().optional(),
  informant: z.string().optional(),
  reliability: z.enum(['reliable', 'partially_reliable', 'unreliable']).optional() as z.ZodType<ReliabilityOption | undefined>,
});

export type BasicInfoFormValues = z.infer<typeof profileFormSchema>;

interface BasicInfoFormProps {
  initialData?: BasicInfoFormValues | null;
  onSave: (data: BasicInfoFormValues) => void;
}

export function BasicInfoForm({ initialData, onSave }: BasicInfoFormProps) {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  const defaultFormValues: BasicInfoFormValues = {
    name: "", gender: undefined, dob: undefined, address: "",
    hadPreviousCheckup: false, agreesToIntervention: false,
    contactPhone: "", contactEmail: "", bloodType: undefined, maritalStatus: undefined,
    occupation: "", educationLevel: undefined,
    // Removed institution-managed fields from default for patient form
    // recordNumber: "", admissionDate: undefined,
    // recordDate: undefined, informant: "", reliability: undefined,
  };

  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialData || defaultFormValues,
    mode: "onChange",
  });
  
  useEffect(() => {
    setIsClient(true);
    if (initialData) {
      form.reset({
        ...initialData,
        dob: initialData.dob ? (typeof initialData.dob === 'string' ? parseISO(initialData.dob) : initialData.dob) : undefined,
        // Institution-managed fields are not reset here as they are removed from patient form
      });
    } else {
         form.reset(defaultFormValues);
    }
  }, [initialData, form]);

  function onSubmit(data: BasicInfoFormValues) {
    onSave(data); 
    toast({
      title: "基本信息已更新",
      description: "您的基本信息已成功保存。",
    });
  }

  if (!isClient && !initialData) { 
    return (
      <Card className="shadow-sm mt-4">
        <CardHeader className="p-4 pb-2"><CardTitle className="text-base">基本信息</CardTitle></CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4 animate-pulse">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded w-full"></div>
            ))}
            <div className="h-10 bg-primary/50 rounded w-24 ml-auto mt-8"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm mt-4">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">基本信息</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>姓名</FormLabel><FormControl><Input placeholder="请输入您的姓名" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem><FormLabel>性别</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="请选择您的性别" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="male">男</SelectItem><SelectItem value="female">女</SelectItem><SelectItem value="other">其他</SelectItem></SelectContent>
                </Select><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="dob" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>生日</FormLabel>
                <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                    {field.value ? format(field.value, "yyyy-MM-dd") : <span>选择日期</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} /></PopoverContent>
                </Popover><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>家庭地址</FormLabel><FormControl><Input placeholder="请输入您的家庭住址" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="hadPreviousCheckup" render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm h-10"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel className="font-normal text-sm">以前在本机构体检过</FormLabel></div><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="agreesToIntervention" render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm h-10"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel className="font-normal text-sm">同意接受健康干预服务</FormLabel></div><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="contactPhone" render={({ field }) => (
                <FormItem><FormLabel>手机</FormLabel><FormControl><Input type="tel" placeholder="请输入您的手机号码" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="contactEmail" render={({ field }) => (
                <FormItem><FormLabel>E-mail (可选)</FormLabel><FormControl><Input type="email" placeholder="请输入您的邮箱地址" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="bloodType" render={({ field }) => (
                <FormItem className="space-y-2"><FormLabel>血型</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} defaultValue={field.value} className="flex flex-wrap gap-x-3 gap-y-1">
                    <FormItem className="flex items-center space-x-1.5"><FormControl><RadioGroupItem value="A" /></FormControl><FormLabel className="font-normal text-sm">A型</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-1.5"><FormControl><RadioGroupItem value="B" /></FormControl><FormLabel className="font-normal text-sm">B型</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-1.5"><FormControl><RadioGroupItem value="O" /></FormControl><FormLabel className="font-normal text-sm">O型</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-1.5"><FormControl><RadioGroupItem value="AB" /></FormControl><FormLabel className="font-normal text-sm">AB型</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-1.5"><FormControl><RadioGroupItem value="unknown" /></FormControl><FormLabel className="font-normal text-sm">未知</FormLabel></FormItem>
                </RadioGroup></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="maritalStatus" render={({ field }) => (
                <FormItem className="space-y-2"><FormLabel>婚姻</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} defaultValue={field.value} className="flex flex-wrap gap-x-3 gap-y-1">
                    <FormItem className="flex items-center space-x-1.5"><FormControl><RadioGroupItem value="unmarried" /></FormControl><FormLabel className="font-normal text-sm">未婚</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-1.5"><FormControl><RadioGroupItem value="married" /></FormControl><FormLabel className="font-normal text-sm">已婚</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-1.5"><FormControl><RadioGroupItem value="divorced" /></FormControl><FormLabel className="font-normal text-sm">离婚</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-1.5"><FormControl><RadioGroupItem value="widowed" /></FormControl><FormLabel className="font-normal text-sm">丧偶</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-1.5"><FormControl><RadioGroupItem value="other" /></FormControl><FormLabel className="font-normal text-sm">其他</FormLabel></FormItem>
                </RadioGroup></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="occupation" render={({ field }) => (
                <FormItem><FormLabel>职业</FormLabel><FormControl><Input placeholder="请输入您的职业" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="educationLevel" render={({ field }) => (
                <FormItem><FormLabel>文化程度</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="请选择文化程度" /></SelectTrigger></FormControl>
                    <SelectContent>{educationLevelOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select><FormMessage /></FormItem>
            )}/>

            <div className="flex justify-end pt-4">
                <Button type="submit">保存基本信息</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
