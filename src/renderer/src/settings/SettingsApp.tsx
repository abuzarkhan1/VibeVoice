import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GeneralTab } from './GeneralTab'
import { DictationTab } from './DictationTab'
import { SpeechTab } from './SpeechTab'
import { AITab } from './AITab'
import { AboutTab } from './AboutTab'

export function SettingsApp(): React.JSX.Element {
  return (
    <div className="h-full w-full bg-background text-foreground">
      <Tabs defaultValue="general" className="flex flex-col h-full">
        <header className="px-6 pt-5 pb-4 border-b border-border">
          <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
          <TabsList className="mt-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="dictation">Dictation</TabsTrigger>
            <TabsTrigger value="speech">Speech</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
        </header>
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="general" className="m-0">
            <GeneralTab />
          </TabsContent>
          <TabsContent value="dictation" className="m-0">
            <DictationTab />
          </TabsContent>
          <TabsContent value="speech" className="m-0">
            <SpeechTab />
          </TabsContent>
          <TabsContent value="ai" className="m-0">
            <AITab />
          </TabsContent>
          <TabsContent value="about" className="m-0">
            <AboutTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
