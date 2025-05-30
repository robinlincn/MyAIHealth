
'use client';

import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// Imports Radix UI Select components from the main app
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import type { SaasEnterprise } from '@/lib/types';

const enterpriseSchema = z.object({
  name: z.string().min(2, { message: "企业名称至少需要2个字符。" }),
  contactPerson: z.string().min(2, { message: "联系人姓名至少需要2个字符。" }),
  contactEmail: z.string().email({ message: "请输入有效的邮箱地址。" }),
  contactPhone: z.string().regex(/^1[3-9]\d{9}$/, { message: "请输入有效的中国大陆手机号码。" }),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending_approval', 'suspended']),
  assignedResources: z.object({
    maxUsers: z.coerce.number().min(1, {message: "用户数至少为1"}).positive({message: "用户数必须为正数"}),
    maxStorageGB: z.coerce.number().min(1, {message: "存储空间至少为1GB"}).positive({message: "存储空间必须为正数"}),
    maxPatients: z.coerce.number().min(1, {message: "病人额度至少为1"}).positive({message: "病人额度必须为正数"}),
  }),
  notes: z.string().optional(),
});

type EnterpriseFormValues = z.infer<typeof enterpriseSchema>;

interface EnterpriseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SaasEnterprise) => void;
  enterprise?: SaasEnterprise | null;
}

export function EnterpriseDialog({ isOpen, onClose, onSubmit, enterprise }: EnterpriseDialogProps) {
  const form = useForm<EnterpriseFormValues>({
    resolver: zodResolver(enterpriseSchema),
    defaultValues: enterprise ? {
      ...enterprise,
      status: enterprise.status || 'pending_approval', // ensure status has a default
      assignedResources: {
        maxUsers: enterprise.assignedResources?.maxUsers || 10,
        maxStorageGB: enterprise.assignedResources?.maxStorageGB || 5,
        maxPatients: enterprise.assignedResources?.maxPatients || 100,
      }
    } : {
      name: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      status: 'pending_approval',
      assignedResources: { maxUsers: 10, maxStorageGB: 5, maxPatients: 100 },
      notes: '',
    },
  });

  useEffect(() => {
    if (isOpen) { 
        if (enterprise) {
        form.reset({
            ...enterprise,
            status: enterprise.status || 'pending_approval',
            assignedResources: {
            maxUsers: enterprise.assignedResources?.maxUsers || 10,
            maxStorageGB: enterprise.assignedResources?.maxStorageGB || 5,
            maxPatients: enterprise.assignedResources?.maxPatients || 100,
            }
        });
        } else {
        form.reset({
            name: '',
            contactPerson: '',
            contactEmail: '',
            contactPhone: '',
            address: '',
            status: 'pending_approval',
            assignedResources: { maxUsers: 10, maxStorageGB: 5, maxPatients: 100 },
            notes: '',
        });
        }
    }
  }, [enterprise, form, isOpen]);

  const handleFormSubmit: SubmitHandler<EnterpriseFormValues> = (data) => {
    const enterpriseToSubmit: SaasEnterprise = {
      ...enterprise, 
      id: enterprise?.id || `ent-${Date.now().toString()}`, 
      creationDate: enterprise?.creationDate || new Date().toISOString(), 
      ...data,
      notes: data.notes || undefined, // Ensure notes is undefined if empty
    };
    onSubmit(enterpriseToSubmit);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{enterprise ? '编辑企业账户' : '新增企业账户'}</DialogTitle>
          <DialogDescription>
            {enterprise ? '修改企业账户的详细信息。' : '填写以下信息以创建一个新的企业账户。'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
                control={form.control}
                name="name"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>企业名称</FormLabel>
                        <FormControl>
                             <Input id={field.name} {...field} />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="contactPerson"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>联系人</FormLabel>
                        <FormControl>
                             <Input id={field.name} {...field} />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="contactEmail"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>联系邮箱</FormLabel>
                        <FormControl>
                             <Input id={field.name} type="email" {...field} />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="contactPhone"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>联系电话</FormLabel>
                        <FormControl>
                             <Input id={field.name} type="tel" {...field} />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="address"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>地址 (可选)</FormLabel>
                        <FormControl>
                             <Input id={field.name} {...field} />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                  <FormItem>
                      <FormLabel>账户状态</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger id={field.name}>
                                <SelectValue placeholder="选择账户状态" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="pending_approval">待审批</SelectItem>
                            <SelectItem value="active">已激活</SelectItem>
                            <SelectItem value="inactive">未激活</SelectItem>
                            <SelectItem value="suspended">已暂停</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )}
            />

            <fieldset className="border p-3 rounded-md">
              <legend className="text-sm font-medium px-1">资源分配</legend>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                <FormField
                    control={form.control}
                    name="assignedResources.maxUsers"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>最大用户数</FormLabel>
                            <FormControl>
                                <Input id={field.name} type="number" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="assignedResources.maxStorageGB"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>最大存储 (GB)</FormLabel>
                            <FormControl>
                                <Input id={field.name} type="number" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="assignedResources.maxPatients"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>最大病人额度</FormLabel>
                            <FormControl>
                                <Input id={field.name} type="number" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
              </div>
            </fieldset>
             <FormField
                control={form.control}
                name="notes"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>备注 (可选)</FormLabel>
                        <FormControl>
                            <Textarea id={field.name} {...field} />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>取消</Button>
              <Button type="submit">{enterprise ? '保存更改' : '创建账户'}</Button>
            </DialogFooter>
          </form>
        </Form>
         <DialogClose asChild>
            <button type="button" className="sr-only">Close</button>
         </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
