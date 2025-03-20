import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Check, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TemplateVariable = {
  key: string;
  label: string;
  defaultValue?: string;
};

type EmailTemplate = {
  id: string;
  name: string;
  template: string;
  variables: TemplateVariable[];
  subject?: string;
  recipient?: string;
};

// Default built-in templates
const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'introduction',
    name: 'Introduction',
    subject: 'Introduction: {{senderName}} from {{company}}',
    template: `Hello {{receiverName}},

I hope this email finds you well. My name is {{senderName}} from {{company}}. I'm reaching out because {{reason}}.

I would love to connect and discuss how we might work together. Would you be available for a brief call next week?

Best regards,
{{senderName}}
{{senderRole}}
{{company}}`,
    variables: [
      { key: 'receiverName', label: 'Recipient name' },
      { key: 'senderName', label: 'Your name' },
      { key: 'senderRole', label: 'Your role' },
      { key: 'company', label: 'Company name' },
      { key: 'reason', label: 'Reason for contact' }
    ]
  },
  {
    id: 'follow-up',
    name: 'Follow-up',
    subject: 'Follow-up: {{meetingTopic}}',
    recipient: '{{recipientEmail}}',
    template: `Hi {{receiverName}},

Thank you for taking the time to meet with me yesterday regarding {{meetingTopic}}. I appreciated your insights on {{keyPoint}}.

As discussed, I'll {{nextAction}} by {{deadline}}.

Please let me know if you have any questions or need further information.

Best regards,
{{senderName}}`,
    variables: [
      { key: 'receiverName', label: 'Recipient name' },
      { key: 'recipientEmail', label: 'Recipient email' },
      { key: 'meetingTopic', label: 'Meeting topic' },
      { key: 'keyPoint', label: 'Key discussion point' },
      { key: 'nextAction', label: 'Your next action' },
      { key: 'deadline', label: 'Deadline' },
      { key: 'senderName', label: 'Your name' }
    ]
  },
  {
    id: 'request',
    name: 'Request',
    subject: 'Request: {{requestTopic}}',
    template: `Dear {{receiverName}},

I'm writing to request {{requestTopic}}. This is important because {{importance}}.

The specific details are as follows:
- {{detail1}}
- {{detail2}}

I would appreciate your response by {{deadline}}. Please let me know if you need any additional information.

Thank you for your consideration.

Sincerely,
{{senderName}}
{{senderDepartment}}`,
    variables: [
      { key: 'receiverName', label: 'Recipient name' },
      { key: 'requestTopic', label: 'Request topic' },
      { key: 'importance', label: 'Why it matters' },
      { key: 'detail1', label: 'Detail 1' },
      { key: 'detail2', label: 'Detail 2' },
      { key: 'deadline', label: 'Deadline' },
      { key: 'senderName', label: 'Your name' },
      { key: 'senderDepartment', label: 'Your department' }
    ]
  }
];

// User template from database
type UserTemplate = {
  id: number;
  name: string;
  data: {
    senderName?: string;
    senderRole?: string;
    subject?: string;
    content?: string;
  };
  isDefault: boolean;
  created_at: string;
  updated_at: string;
};

type TemplateData = {
  [key: string]: string;
};

type TemplateSelectProps = {
  onApplyTemplate: (content: string, subject?: string, recipient?: string) => void;
  onClose: () => void;
  currentSender?: string;
  currentSenderRole?: string;
};

export function TemplateSelector({ 
  onApplyTemplate, 
  onClose,
  currentSender = '',
  currentSenderRole = ''
}: TemplateSelectProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [templateData, setTemplateData] = useState<TemplateData>({});
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('built-in');
  
  // New template creation state
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newSenderName, setNewSenderName] = useState('');
  const [newSenderRole, setNewSenderRole] = useState('');
  
  // Fetch user templates with useCallback to avoid dependency issues
  const fetchUserTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/templates');
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      
      const data = await response.json();
      setUserTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your templates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Fetch templates on mount
  useEffect(() => {
    fetchUserTemplates();
  }, [fetchUserTemplates]);
  
  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    
    // Initialize with default values if any
    const initialData: TemplateData = {};
    template.variables.forEach(variable => {
      if (variable.defaultValue) {
        initialData[variable.key] = variable.defaultValue;
      }
    });
    
    setTemplateData(initialData);
  };
  
  const handleInputChange = (key: string, value: string) => {
    setTemplateData(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const applyTemplate = () => {
    if (!selectedTemplate) return;
    
    let content = selectedTemplate.template;
    let subject = selectedTemplate.subject || '';
    let recipient = selectedTemplate.recipient || '';
    
    // Replace variables in the template
    Object.entries(templateData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(regex, value || `[${key}]`);
      subject = subject.replace(regex, value || `[${key}]`);
      recipient = recipient.replace(regex, value || `[${key}]`);
    });
    
    onApplyTemplate(content, subject, recipient);
    onClose();
  };
  
  // Apply a user template directly
  const applyUserTemplate = (template: UserTemplate) => {
    const { data } = template;
    const content = data.content || '';
    const subject = data.subject || '';
    
    onApplyTemplate(content, subject);
    onClose();
  };
  
  // Create a new user template
  const createUserTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a template name',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const templateData = {
        senderName: newSenderName || currentSender,
        senderRole: newSenderRole || currentSenderRole,
      };
      
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTemplateName,
          data: templateData,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create template');
      }
      
      // Refresh templates
      await fetchUserTemplates();
      
      // Reset form
      setNewTemplateName('');
      setNewSenderName('');
      setNewSenderRole('');
      setIsCreating(false);
      
      toast({
        title: 'Success',
        description: 'Template created successfully',
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create template',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update an existing user template
  const updateUserTemplate = async (templateId: number) => {
    try {
      setIsLoading(true);
      
      const templateToUpdate = userTemplates.find(t => t.id === templateId);
      if (!templateToUpdate) return;
      
      const updatedData = {
        ...templateToUpdate.data,
        senderName: newSenderName || templateToUpdate.data.senderName || '',
        senderRole: newSenderRole || templateToUpdate.data.senderRole || '',
      };
      
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTemplateName || templateToUpdate.name,
          data: updatedData,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update template');
      }
      
      // Refresh templates
      await fetchUserTemplates();
      
      // Reset form
      setNewTemplateName('');
      setNewSenderName('');
      setNewSenderRole('');
      setIsEditing(null);
      
      toast({
        title: 'Success',
        description: 'Template updated successfully',
      });
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to update template',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a user template
  const deleteUserTemplate = async (templateId: number) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete template');
      }
      
      // Refresh templates
      await fetchUserTemplates();
      
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start editing a template
  const startEditing = (template: UserTemplate) => {
    setIsEditing(template.id);
    setNewTemplateName(template.name);
    setNewSenderName(template.data.senderName || '');
    setNewSenderRole(template.data.senderRole || '');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-medium">Email Templates</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="text-xs"
        >
          Close
        </Button>
      </div>
      
      <Tabs defaultValue="built-in" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="built-in">Built-in Templates</TabsTrigger>
          <TabsTrigger value="personal">My Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="built-in" className="space-y-4">
          {!selectedTemplate ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {DEFAULT_TEMPLATES.map(template => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="justify-start h-auto py-2 px-3 text-left"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div>
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {template.template.substring(0, 60)}...
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{selectedTemplate.name}</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTemplate(null)}
                  className="text-xs"
                >
                  Back to templates
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {selectedTemplate.variables.map(variable => (
                  <div key={variable.key} className="space-y-1">
                    <Label htmlFor={variable.key} className="text-xs">
                      {variable.label}
                    </Label>
                    <Input
                      id={variable.key}
                      value={templateData[variable.key] || ''}
                      onChange={(e) => handleInputChange(variable.key, e.target.value)}
                      placeholder={variable.label}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={applyTemplate}
                className="w-full mt-2"
                disabled={isLoading}
              >
                <Check className="mr-2 h-4 w-4" />
                Apply Template
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="personal" className="space-y-4">
          {isCreating || isEditing !== null ? (
            <div className="space-y-3 border rounded-md p-3">
              <h4 className="text-sm font-medium">
                {isCreating ? 'Create New Template' : 'Edit Template'}
              </h4>
              
              <div className="space-y-2">
                <Label htmlFor="templateName" className="text-xs">Template Name</Label>
                <Input
                  id="templateName"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="E.g., My Professional Persona"
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="senderName" className="text-xs">Your Name</Label>
                  <Input
                    id="senderName"
                    value={newSenderName}
                    onChange={(e) => setNewSenderName(e.target.value)}
                    placeholder="Your name"
                    className="h-8 text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="senderRole" className="text-xs">Your Role</Label>
                  <Input
                    id="senderRole"
                    value={newSenderRole}
                    onChange={(e) => setNewSenderRole(e.target.value)}
                    placeholder="Your professional role"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button 
                  onClick={() => {
                    if (isCreating) {
                      createUserTemplate();
                    } else if (isEditing !== null) {
                      updateUserTemplate(isEditing);
                    }
                  }}
                  disabled={isLoading || !newTemplateName.trim()}
                  className="flex-1"
                  size="sm"
                >
                  <Save className="mr-2 h-3 w-3" />
                  {isCreating ? 'Create' : 'Update'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(null);
                    setNewTemplateName('');
                    setNewSenderName('');
                    setNewSenderRole('');
                  }}
                  size="sm"
                >
                  <X className="mr-2 h-3 w-3" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  setIsCreating(true);
                  // Pre-fill with current values if available
                  setNewSenderName(currentSender);
                  setNewSenderRole(currentSenderRole);
                }}
                className="w-full"
                variant="outline"
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Template
              </Button>
              
              {userTemplates.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">You haven&apos;t created any templates yet.</p>
                  <p className="text-xs mt-1">Create templates to save your sender information for quick reuse.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userTemplates.map(template => (
                    <Card key={template.id} className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-sm">{template.name}</h5>
                          <div className="text-xs text-gray-500 mt-1">
                            {template.data.senderName && (
                              <span className="block">Name: {template.data.senderName}</span>
                            )}
                            {template.data.senderRole && (
                              <span className="block">Role: {template.data.senderRole}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0"
                            onClick={() => startEditing(template)}
                            disabled={isLoading}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteUserTemplate(template.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full mt-2"
                        size="sm"
                        variant="secondary"
                        onClick={() => applyUserTemplate(template)}
                        disabled={isLoading}
                      >
                        Apply
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
