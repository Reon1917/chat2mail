import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Check } from "lucide-react";

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

const EMAIL_TEMPLATES: EmailTemplate[] = [
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

type TemplateData = {
  [key: string]: string;
};

type TemplateSelectProps = {
  onApplyTemplate: (content: string, subject?: string, recipient?: string) => void;
  onClose: () => void;
};

export function TemplateSelector({ onApplyTemplate, onClose }: TemplateSelectProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [templateData, setTemplateData] = useState<TemplateData>({});
  
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
  
  return (
    <Card className="p-4 border border-gray-100 dark:border-gray-800 shadow-sm bg-white/95 dark:bg-gray-800/95">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-medium">Email Templates</h3>
        </div>
        
        {!selectedTemplate ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {EMAIL_TEMPLATES.map(template => (
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
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex justify-end pt-2">
              <Button 
                onClick={applyTemplate} 
                size="sm"
                className="text-xs"
              >
                <Check className="mr-1 h-3.5 w-3.5" />
                Apply Template
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
